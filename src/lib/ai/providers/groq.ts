import type { AICompletionRequest, AICompletionResult, AIProvider } from '../types';

type GroqResponse = {
  choices?: { message?: { content?: string } }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: { message?: string };
};

export class GroqProvider implements AIProvider {
  name = 'groq' as const;
  defaultModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  isConfigured() {
    return Boolean(process.env.GROQ_API_KEY);
  }

  async complete(
    request: AICompletionRequest & { systemPrompt: string; model: string }
  ): Promise<AICompletionResult> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('Groq API key is not configured.');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        temperature: 0.7,
        max_tokens: 1200,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.prompt },
        ],
      }),
    });

    const data = (await response.json()) as GroqResponse;
    if (!response.ok) throw new Error(data.error?.message || 'Groq request failed.');

    const text = data.choices?.[0]?.message?.content || '';
    if (!text.trim()) throw new Error('Groq returned an empty response.');

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
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('Groq API key is not configured.');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        temperature: 0.7,
        max_tokens: 1200,
        stream: true,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.prompt },
        ],
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => undefined)) as GroqResponse | undefined;
      throw new Error(data?.error?.message || 'Groq streaming request failed.');
    }

    if (!response.body) throw new Error('Groq did not return a streaming response.');
    return response.body;
  }
}
