import { NextResponse } from 'next/server';
import { ensureStarterSubscription } from '@/lib/ai/limits';
import { setSessionCookies } from '@/lib/authCookies';
import { supabaseFetch, type AuthSession } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { agencyName, fullName, email, phone, password } = await request.json();

    if (!agencyName || !fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Agency, name, email, and password are required.' },
        { status: 400 }
      );
    }

    const session = await supabaseFetch<AuthSession>('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        data: {
          agency_name: agencyName,
          full_name: fullName,
          email,
          phone,
        },
      }),
    });

    if (session.access_token) {
      await supabaseFetch('/rest/v1/profiles', {
        method: 'POST',
        token: session.access_token,
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({
          id: session.user.id,
          agency_name: agencyName,
          full_name: fullName,
          phone,
          role: 'admin',
          plan: 'starter',
          subscription_status: 'trial',
        }),
      }).catch(() => null);

      await ensureStarterSubscription(session.access_token, session.user.id).catch(() => null);
    }

    const response = NextResponse.json({
      user: session.user,
      requiresEmailConfirmation: !session.access_token,
    });

    if (session.access_token) {
      setSessionCookies(response, session, true, 'admin', 'trial', 60 * 60 * 24 * 14);
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create account.' },
      { status: 400 }
    );
  }
}
