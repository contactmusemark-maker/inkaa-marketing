import { NextResponse } from 'next/server';
import { setSessionCookies } from '@/lib/authCookies';
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
    const hasSubscription = profile?.subscription_status === 'active';
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
    setSessionCookies(response, session, hasSubscription, role);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to sign in.' },
      { status: 401 }
    );
  }
}
