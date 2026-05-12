import type { AICompletionRequest, AICompletionResult, AIProvider } from '../types';

type OpenRouterResponse = {
  choices?: { message?: { content?: string } }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: { message?: string; code?: string | number };
};

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const RETRYABLE_STATUSES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 45000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelay(attempt: number, response?: Response) {
  const retryAfter = response?.headers.get('retry-after');
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : NaN;

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.min(retryAfterSeconds * 1000, 8000);
  }

  return Math.min(500 * 2 ** attempt, 4000);
}

async function fetchWithRetry(url: string, init: RequestInit) {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      if (!RETRYABLE_STATUSES.has(response.status) || attempt === MAX_ATTEMPTS - 1) {
        return response;
      }

      await sleep(getRetryDelay(attempt, response));
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS - 1) break;
      await sleep(getRetryDelay(attempt));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('OpenRouter request failed.');
}

function getOpenRouterErrorMessage(status: number, data?: OpenRouterResponse) {
  const message = data?.error?.message || 'OpenRouter request failed.';
  const lower = message.toLowerCase();

  if (status === 401 || status === 403 || lower.includes('api key')) {
    return 'OpenRouter API key is invalid or missing access.';
  }

  if (status === 429 || lower.includes('rate limit') || lower.includes('quota')) {
    return 'OpenRouter quota or rate limit was reached. The app will try another configured provider.';
  }

  if (status >= 500) {
    return 'OpenRouter is temporarily unavailable. The app will try another configured provider.';
  }

  if (lower.includes('model')) {
    return 'OpenRouter model is unavailable. The app will try another configured provider.';
  }

  return message;
}

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter' as const;
  defaultModel = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  isConfigured() {
    return Boolean(process.env.OPENROUTER_API_KEY);
  }

  private getHeaders(apiKey: string) {
    return {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://inkaa.in',
      'X-Title': 'Inkaa Digital Marketing SaaS',
    };
  }

  private getBody(request: AICompletionRequest & { systemPrompt: string; model: string }) {
    return {
      model: request.model,
      temperature: 0.7,
      max_tokens: 1200,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.prompt },
      ],
    };
  }

  async complete(
    request: AICompletionRequest & { systemPrompt: string; model: string }
  ): Promise<AICompletionResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OpenRouter API key is not configured.');

    const response = await fetchWithRetry(OPENROUTER_URL, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify(this.getBody(request)),
    });

    const data = (await response.json()) as OpenRouterResponse;
    if (!response.ok) throw new Error(getOpenRouterErrorMessage(response.status, data));

    const text = data.choices?.[0]?.message?.content || '';
    if (!text.trim()) throw new Error('OpenRouter returned an empty response.');

    return {
      text,
      provider: this.name,
      model: request.model,
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  }

  async stream(request: AICompletionRequest & { systemPrompt: string; model: string }) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OpenRouter API key is not configured.');

    const response = await fetchWithRetry(OPENROUTER_URL, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({
        ...this.getBody(request),
        stream: true,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => undefined)) as OpenRouterResponse | undefined;
      throw new Error(getOpenRouterErrorMessage(response.status, data));
    }

    if (!response.body) throw new Error('OpenRouter did not return a streaming response.');
    return response.body;
  }
}
