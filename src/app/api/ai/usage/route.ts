import { NextResponse, type NextRequest } from 'next/server';
import { getMonthlyAIUsage } from '@/lib/ai/limits';
import { requireRoles } from '@/lib/rbac';
import { getAuthToken, getCurrentUser, getProfile } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin', 'admin', 'manager', 'member']);
  if (!auth.ok) return auth.response;

  const token = getAuthToken(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const user = await getCurrentUser(token);
    const profile = await getProfile(token, user.id).catch(() => null);
    const usage = await getMonthlyAIUsage(token, user.id, profile?.plan);

    return NextResponse.json({
      usage,
      subscriptionStatus: usage.status || profile?.subscription_status || 'trial',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load AI usage.' },
      { status: 500 }
    );
  }
}
