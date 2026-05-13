import { NextResponse, type NextRequest } from 'next/server';
import { resolveSubscriptionStatus } from '@/lib/billing';
import { formatRole, normalizeRole } from '@/lib/rbacCore';
import { getAuthToken, getCurrentUser, getProfile, supabaseFetch } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const token = getAuthToken(request);

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const user = await getCurrentUser(token);
    const profile = await getProfile(token, user.id).catch(() => null);
    const subscriptions = await supabaseFetch<
      { status: string | null; trial_ends_at: string | null }[]
    >(
      `/rest/v1/subscriptions?user_id=eq.${encodeURIComponent(user.id)}&select=status,trial_ends_at&limit=1`,
      { token }
    ).catch(() => []);
    const subscriptionStatus = resolveSubscriptionStatus(
      subscriptions[0]?.status ?? profile?.subscription_status,
      subscriptions[0]?.trial_ends_at
    );
    const role = normalizeRole(profile?.role);

    return NextResponse.json({
      user: {
        id: user.id,
        email: profile?.email ?? user.email,
        name: profile?.full_name ?? user.user_metadata?.full_name ?? user.email,
        agencyName: profile?.agency_name ?? user.user_metadata?.agency_name ?? null,
        role,
        roleLabel: formatRole(role),
        plan: profile?.plan ?? 'starter',
        subscriptionStatus,
      },
      hasSubscription: ['active', 'trial'].includes(subscriptionStatus),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load current user.' },
      { status: 401 }
    );
  }
}
