import { NextResponse } from 'next/server';
import { supabaseFetch } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    await supabaseFetch('/auth/v1/recover', {
      method: 'POST',
      body: JSON.stringify({
        email,
        redirect_to: `${siteUrl}/sign-up-login`,
      }),
    });

    return NextResponse.json({
      ok: true,
      message: 'If an account exists for this email, a password reset link has been sent.',
    });
  } catch {
    return NextResponse.json({
      ok: true,
      message: 'If an account exists for this email, a password reset link has been sent.',
    });
  }
}
