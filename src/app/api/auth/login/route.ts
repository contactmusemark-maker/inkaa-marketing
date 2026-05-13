import { NextResponse } from 'next/server';
import { setSessionCookies } from '@/lib/authCookies';
import { resolveSubscriptionStatus } from '@/lib/billing';
import { getProfile, supabaseFetch, type AuthSession } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const session = await supabaseFetch<AuthSession>('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const profile = await getProfile(session.access_token, session.user.id).catch(() => null);
    const subscriptions = await supabaseFetch<
      { status: string | null; trial_ends_at: string | null }[]
    >(
      `/rest/v1/subscriptions?user_id=eq.${encodeURIComponent(session.user.id)}&select=status,trial_ends_at&limit=1`,
      { token: session.access_token }
    ).catch(() => []);
    const subscriptionStatus = resolveSubscriptionStatus(
      subscriptions[0]?.status ?? profile?.subscription_status,
      subscriptions[0]?.trial_ends_at
    );
    const hasSubscription = ['active', 'trial'].includes(subscriptionStatus);
    const subscriptionMaxAge =
      subscriptionStatus === 'trial' && subscriptions[0]?.trial_ends_at
        ? Math.max(
            60,
            Math.floor((new Date(subscriptions[0].trial_ends_at).getTime() - Date.now()) / 1000)
          )
        : 60 * 60 * 24 * 365;
    const role = profile?.role ?? 'member';

    const response = NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: profile?.full_name ?? session.user.user_metadata?.full_name ?? null,
        role,
        plan: profile?.plan ?? 'starter',
      },
      hasSubscription,
    });
    setSessionCookies(
      response,
      session,
      hasSubscription,
      role,
      subscriptionStatus,
      subscriptionMaxAge
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to sign in.' },
      { status: 401 }
    );
  }
}
