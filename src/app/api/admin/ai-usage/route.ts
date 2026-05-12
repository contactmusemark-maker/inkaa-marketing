import { NextResponse, type NextRequest } from 'next/server';
import { getPlanAILimit } from '@/lib/ai/limits';
import { logAdminAction } from '@/lib/adminAudit';
import { requireRoles } from '@/lib/rbac';
import { supabaseAdminFetch } from '@/lib/supabase';

type AdminSubscriptionUsage = {
  user_id: string;
  plan: string;
  status: string;
  ai_limit: number | null;
  ai_used: number;
  current_period_end: string | null;
};

type AdminUsageLog = {
  user_id: string;
  provider: string;
  tool: string;
  tokens_used: number;
  created_at: string;
};

async function loadAdminAnalyticsTable<T>(path: string) {
  try {
    const data = await supabaseAdminFetch<T[]>(path);
    return { data, error: '' };
  } catch (error) {
    return {
      data: [] as T[],
      error: error instanceof Error ? error.message : 'Unable to load analytics data.',
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRoles(request, ['super_admin']);
    if (!auth.ok) return auth.response;

    const [subscriptionsResult, usageLogsResult] = await Promise.all([
      loadAdminAnalyticsTable<AdminSubscriptionUsage>(
        '/rest/v1/subscriptions?select=user_id,plan,status,ai_limit,ai_used,current_period_end&order=ai_used.desc&limit=25'
      ),
      loadAdminAnalyticsTable<AdminUsageLog>(
        '/rest/v1/ai_usage_logs?select=user_id,provider,tool,tokens_used,created_at&order=created_at.desc&limit=100'
      ),
    ]);

    const subscriptions = subscriptionsResult.data;
    const usageLogs = usageLogsResult.data;
    const schemaIssues = [subscriptionsResult.error, usageLogsResult.error].filter(Boolean);

    const totalGenerations = usageLogs.length;
    const totalTokens = usageLogs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);

    return NextResponse.json({
      totals: {
        totalGenerations,
        totalTokens,
        activeSubscriptions: subscriptions.filter((sub) => ['active', 'trial'].includes(sub.status))
          .length,
      },
      topUsers: subscriptions,
      recentUsage: usageLogs,
      aiToolsEnabled: process.env.AI_TOOLS_ENABLED !== 'false',
      schemaIssues,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load AI usage analytics.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireRoles(request, ['super_admin']);
    if (!auth.ok) return auth.response;
    const body = await request.json();
    const userId = typeof body.userId === 'string' ? body.userId : '';

    if (!userId) {
      return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.resetUsage === true) updates.ai_used = 0;
    if (typeof body.aiLimit === 'number' || body.aiLimit === null) updates.ai_limit = body.aiLimit;
    if (typeof body.plan === 'string') {
      updates.plan = body.plan;
      updates.ai_limit = getPlanAILimit(body.plan);
    }
    if (typeof body.status === 'string') updates.status = body.status;

    await supabaseAdminFetch(`/rest/v1/subscriptions?user_id=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    await logAdminAction(request, {
      actorId: auth.user.id,
      actorRole: auth.role,
      action: 'admin.ai_usage.update',
      targetUserId: userId,
      metadata: updates,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update AI usage.' },
      { status: 500 }
    );
  }
}
