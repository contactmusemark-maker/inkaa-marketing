import { getSystemPrompt } from '@/lib/ai/prompts';
import { getConfiguredProviders, getProvider } from '@/lib/ai/providers';
import type { AICompletionRequest, AICompletionResult, AIProviderName } from '@/lib/ai/types';

export async function generateAIContent(request: AICompletionRequest): Promise<AICompletionResult> {
  const provider = getProvider(request.provider);
  if (!provider.isConfigured()) {
    throw new Error(
      'No AI provider is configured. Add GEMINI_API_KEY, OPENROUTER_API_KEY, or GROQ_API_KEY.'
    );
  }

  const systemPrompt = getSystemPrompt(request.tool);
  const candidates = [
    provider,
    ...getConfiguredProviders().filter((candidate) => candidate.name !== provider.name),
  ];
  let lastError: unknown;

  for (const candidate of candidates) {
    try {
      const model =
        candidate.name === provider.name
          ? request.model || candidate.defaultModel
          : candidate.defaultModel;

      return await candidate.complete({
        ...request,
        provider: candidate.name,
        model,
        systemPrompt,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unable to generate AI content.');
}

export async function generateAIStream(
  request: AICompletionRequest
): Promise<{ stream: ReadableStream<Uint8Array>; provider: AIProviderName; model: string }> {
  const provider = getProvider(request.provider);
  if (!provider.isConfigured()) {
    throw new Error(
      'No AI provider is configured. Add GEMINI_API_KEY, OPENROUTER_API_KEY, or GROQ_API_KEY.'
    );
  }

  const systemPrompt = getSystemPrompt(request.tool);
  const candidates = [
    provider,
    ...getConfiguredProviders().filter((candidate) => candidate.name !== provider.name),
  ];
  let lastError: unknown;

  for (const candidate of candidates) {
    if (!candidate.stream) continue;

    try {
      const model =
        candidate.name === provider.name
          ? request.model || candidate.defaultModel
          : candidate.defaultModel;
      const stream = await candidate.stream({
        ...request,
        provider: candidate.name,
        model,
        systemPrompt,
      });

      return { stream, provider: candidate.name, model };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('No configured AI provider supports streaming responses.');
}
