import { NextResponse, type NextRequest } from 'next/server';
import { getMonthlyAIUsage, incrementAIUsage } from '@/lib/ai/limits';
import { checkRateLimit } from '@/lib/ai/rateLimit';
import type { AIProviderName, AIToolType } from '@/lib/ai/types';
import { requireRoles } from '@/lib/rbac';
import { getAuthToken, getCurrentUser, getProfile, supabaseFetch } from '@/lib/supabase';
import { generateAIContent, generateAIStream } from '@/services/ai/generate';

const toolLabels: Record<AIToolType, string> = {
  proposal: 'proposal',
  captions: 'captions',
  campaign: 'campaign',
  pricing: 'pricing',
  email: 'email',
};

function validatePrompt(prompt: unknown) {
  if (typeof prompt !== 'string') return 'Prompt is required.';
  const trimmed = prompt.trim();
  if (trimmed.length < 10) return 'Prompt must be at least 10 characters.';
  if (trimmed.length > 4000) return 'Prompt must be 4000 characters or fewer.';
  return null;
}

async function logGeneration(
  token: string,
  payload: {
    userId: string;
    tool: AIToolType;
    provider: string;
    model: string;
    prompt: string;
    response: string;
    totalTokens: number;
  }
) {
  await supabaseFetch('/rest/v1/ai_generations', {
    method: 'POST',
    token,
    body: JSON.stringify({
      user_id: payload.userId,
      tool: payload.tool,
      provider: payload.provider,
      model: payload.model,
      prompt: payload.prompt,
      response: payload.response,
      generation_type: payload.tool,
      response_length: payload.response.length,
      tokens_used: payload.totalTokens,
      total_tokens: payload.totalTokens,
    }),
  }).catch(() => null);

  await supabaseFetch('/rest/v1/ai_usage_logs', {
    method: 'POST',
    token,
    body: JSON.stringify({
      user_id: payload.userId,
      tool: payload.tool,
      provider: payload.provider,
      model: payload.model,
      generation_type: payload.tool,
      prompt: payload.prompt,
      response_length: payload.response.length,
      tokens_used: payload.totalTokens,
      total_tokens: payload.totalTokens,
    }),
  }).catch(() => null);
}

async function logUsage(
  token: string,
  payload: {
    userId: string;
    tool: AIToolType;
    provider: string;
    model: string;
    prompt: string;
  }
) {
  await supabaseFetch('/rest/v1/ai_usage_logs', {
    method: 'POST',
    token,
    body: JSON.stringify({
      user_id: payload.userId,
      tool: payload.tool,
      provider: payload.provider,
      model: payload.model,
      generation_type: payload.tool,
      prompt: payload.prompt,
      response_length: 0,
      tokens_used: 0,
      total_tokens: 0,
    }),
  }).catch(() => null);
}

export function createAIHandler(tool: AIToolType) {
  return async function POST(request: NextRequest) {
    const auth = await requireRoles(request, ['super_admin', 'admin', 'manager', 'member']);
    if (!auth.ok) return auth.response;

    const token = getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    if (process.env.AI_TOOLS_ENABLED === 'false') {
      return NextResponse.json(
        { error: 'AI tools are disabled for this workspace.' },
        { status: 403 }
      );
    }

    try {
      const user = await getCurrentUser(token);
      const profile = await getProfile(token, user.id).catch(() => null);

      if (
        profile?.subscription_status &&
        !['active', 'trial'].includes(profile.subscription_status)
      ) {
        return NextResponse.json(
          {
            error: 'AI tools are locked because your subscription is not active.',
            upgradeRequired: true,
            upgradeUrl: '/billing',
          },
          { status: 402 }
        );
      }

      const usage = await getMonthlyAIUsage(token, user.id, profile?.plan);

      if (!usage.allowed) {
        return NextResponse.json(
          {
            error: 'AI limit reached. Upgrade your plan to continue.',
            upgradeRequired: true,
            upgradeUrl: '/billing',
            usage,
          },
          { status: 429 }
        );
      }

      const rateLimit = checkRateLimit(`${user.id}:${toolLabels[tool]}`, 8, 60 * 1000);

      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: 'Too many AI requests too quickly. Please wait a moment and try again.',
            resetAt: rateLimit.resetAt,
          },
          { status: 429 }
        );
      }

      const body = await request.json();
      const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
      const validationError = validatePrompt(prompt);

      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }

      if (body.stream === true) {
        const result = await generateAIStream({
          tool,
          prompt,
          provider: body.provider as AIProviderName | undefined,
          model: typeof body.model === 'string' ? body.model : undefined,
          userId: user.id,
        });

        await logUsage(token, {
          userId: user.id,
          tool,
          provider: result.provider,
          model: result.model,
          prompt,
        });
        await incrementAIUsage(token, usage.subscriptionId, usage.used + 1);

        return new Response(result.stream, {
          headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-AI-Provider': result.provider,
            'X-AI-Model': result.model,
          },
        });
      }

      const result = await generateAIContent({
        tool,
        prompt,
        provider: body.provider as AIProviderName | undefined,
        model: typeof body.model === 'string' ? body.model : undefined,
        userId: user.id,
      });

      await logGeneration(token, {
        userId: user.id,
        tool,
        provider: result.provider,
        model: result.model,
        prompt,
        response: result.text,
        totalTokens: result.usage.totalTokens,
      });
      await incrementAIUsage(token, usage.subscriptionId, usage.used + 1);

      return NextResponse.json({
        text: result.text,
        provider: result.provider,
        model: result.model,
        usage: result.usage,
        planUsage: {
          ...usage,
          used: usage.used + 1,
          remaining: usage.remaining === null ? null : Math.max(0, usage.remaining - 1),
          upgradeRequired:
            usage.limit !== null &&
            usage.remaining !== null &&
            Math.max(0, usage.remaining - 1) <= 0,
        },
        remaining: rateLimit.remaining,
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unable to generate AI content.' },
        { status: 500 }
      );
    }
  };
}
