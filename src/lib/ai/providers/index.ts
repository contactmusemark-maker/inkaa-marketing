import { GeminiProvider } from './gemini';
import { GroqProvider } from './groq';
import { OpenRouterProvider } from './openrouter';
import type { AIProvider, AIProviderName } from '../types';

const fallbackPriority: AIProviderName[] = ['gemini', 'openrouter', 'groq'];

const providers: Record<AIProviderName, AIProvider> = {
  gemini: new GeminiProvider(),
  openrouter: new OpenRouterProvider(),
  groq: new GroqProvider(),
};

function getProviderByPriority() {
  return fallbackPriority.map((providerName) => providers[providerName]);
}

export function getProvider(name?: AIProviderName) {
  if (name && providers[name]?.isConfigured()) return providers[name];

  const preferred = process.env.AI_PROVIDER as AIProviderName | undefined;
  if (preferred && providers[preferred]?.isConfigured()) return providers[preferred];

  return getProviderByPriority().find((provider) => provider.isConfigured()) ?? providers.gemini;
}

export function getProviderByName(name: AIProviderName) {
  return providers[name];
}

export function getConfiguredProviders() {
  return getProviderByPriority().filter((provider) => provider.isConfigured());
}

export function getProviderStatus() {
  const activeProvider = getProvider();
  const configuredProviders = getConfiguredProviders();
  const fallbackProvider =
    configuredProviders.find((provider) => provider.name !== activeProvider.name) ?? null;

  return {
    activeProvider: activeProvider.isConfigured() ? activeProvider.name : null,
    activeModel: activeProvider.isConfigured() ? activeProvider.defaultModel : null,
    fallbackProvider: fallbackProvider?.name ?? null,
    fallbackModel: fallbackProvider?.defaultModel ?? null,
    priority: fallbackPriority,
    providers: getProviderByPriority().map((provider, index) => ({
      name: provider.name,
      priority: index + 1,
      active: activeProvider.isConfigured() && provider.name === activeProvider.name,
      fallback: fallbackProvider?.name === provider.name,
      configured: provider.isConfigured(),
      defaultModel: provider.defaultModel,
    })),
  };
}
