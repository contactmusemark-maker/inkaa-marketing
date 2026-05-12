export type AIProviderName = 'gemini' | 'openrouter' | 'groq';

export type AIToolType = 'proposal' | 'captions' | 'campaign' | 'pricing' | 'email';

export type AICompletionRequest = {
  tool: AIToolType;
  prompt: string;
  provider?: AIProviderName;
  model?: string;
  userId: string;
};

export type AICompletionResult = {
  text: string;
  provider: AIProviderName;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
};

export interface AIProvider {
  name: AIProviderName;
  defaultModel: string;
  isConfigured(): boolean;
  complete(
    request: AICompletionRequest & { systemPrompt: string; model: string }
  ): Promise<AICompletionResult>;
  stream?(
    request: AICompletionRequest & { systemPrompt: string; model: string }
  ): Promise<ReadableStream<Uint8Array>>;
}
