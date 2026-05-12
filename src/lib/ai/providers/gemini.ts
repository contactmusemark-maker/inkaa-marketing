import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AICompletionRequest, AICompletionResult, AIProvider } from '../types';

type UsageMetadata = {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
};

function getGeminiErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Gemini request failed.';
  const lower = message.toLowerCase();

  if (lower.includes('api key') || lower.includes('permission') || lower.includes('unauthorized')) {
    return 'Gemini API key is invalid or does not have access to this model.';
  }

  if (
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('resource exhausted')
  ) {
    return 'Gemini quota was exceeded. The app will try another configured provider.';
  }

  if (lower.includes('not found') || lower.includes('model')) {
    return 'Gemini model is unavailable. The app will try another configured provider.';
  }

  return message;
}

export class GeminiProvider implements AIProvider {
  name = 'gemini' as const;
  defaultModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';

  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async complete(
    request: AICompletionRequest & { systemPrompt: string; model: string }
  ): Promise<AICompletionResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key is not configured.');

    const models = Array.from(
      new Set([request.model, 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'])
    );
    let lastError: unknown;

    for (const modelName of models) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: request.systemPrompt,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200,
          },
        });

        const result = await model.generateContent(request.prompt);
        const text = result.response.text();
        const usage = (result.response as unknown as { usageMetadata?: UsageMetadata })
          .usageMetadata;

        if (!text.trim()) throw new Error('Gemini returned an empty response.');

        return {
          text,
          provider: this.name,
          model: modelName,
          usage: {
            inputTokens: usage?.promptTokenCount ?? 0,
            outputTokens: usage?.candidatesTokenCount ?? 0,
            totalTokens: usage?.totalTokenCount ?? 0,
          },
        };
      } catch (error) {
        lastError = error;
      }
    }

    throw new Error(getGeminiErrorMessage(lastError));
  }

  async stream(request: AICompletionRequest & { systemPrompt: string; model: string }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key is not configured.');

    const models = Array.from(
      new Set([request.model, 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'])
    );
    let lastError: unknown;

    for (const modelName of models) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: request.systemPrompt,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200,
          },
        });
        const result = await model.generateContentStream(request.prompt);
        const encoder = new TextEncoder();

        return new ReadableStream<Uint8Array>({
          async start(controller) {
            try {
              for await (const chunk of result.stream) {
                const text = chunk.text();
                if (!text) continue;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ text, provider: 'gemini', model: modelName })}\n\n`
                  )
                );
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          },
        });
      } catch (error) {
        lastError = error;
      }
    }

    throw new Error(getGeminiErrorMessage(lastError));
  }
}
