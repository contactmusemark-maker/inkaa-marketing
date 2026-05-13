import { NextResponse } from 'next/server';
import type { AuthSession } from './supabase';
import { normalizeRole } from './rbacCore';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function setSessionCookies(
  response: NextResponse,
  session: AuthSession,
  hasSubscription = false,
  role = 'member',
  subscriptionStatus = 'active',
  subscriptionMaxAge = COOKIE_MAX_AGE
) {
  response.cookies.set('inkaa_auth', session.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: session.expires_in ?? COOKIE_MAX_AGE,
  });

  if (session.refresh_token) {
    response.cookies.set('inkaa_refresh', session.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: subscriptionMaxAge,
    });
  }

  if (hasSubscription) {
    response.cookies.set('inkaa_subscription', subscriptionStatus, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });
  } else {
    response.cookies.delete('inkaa_subscription');
  }

  response.cookies.set('inkaa_role', normalizeRole(role), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.delete('inkaa_auth');
  response.cookies.delete('inkaa_refresh');
  response.cookies.delete('inkaa_subscription');
  response.cookies.delete('inkaa_role');
}
