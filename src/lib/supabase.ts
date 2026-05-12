import type { NextRequest } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    agency_name?: string;
    phone?: string;
  };
};

export type AuthSession = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user: SupabaseUser;
};

export class SupabaseConfigError extends Error {
  constructor() {
    super(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
}

function assertSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new SupabaseConfigError();
  }

  return { url: SUPABASE_URL.replace(/\/$/, ''), anonKey: SUPABASE_ANON_KEY };
}

export function getAuthToken(request: NextRequest) {
  return request.cookies.get('inkaa_auth')?.value;
}

export async function supabaseFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
) {
  const { url, anonKey } = assertSupabaseConfig();
  const headers = new Headers(options.headers);
  headers.set('apikey', anonKey);
  headers.set('Authorization', `Bearer ${options.token || anonKey}`);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${url}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data?.error_description || data?.message || data?.msg || 'Supabase request failed';
    const schemaMismatch =
      typeof message === 'string' &&
      (message.includes('Could not find') ||
        message.includes('column') ||
        message.includes('schema cache'));

    if (schemaMismatch) {
      throw new Error(
        `${message}. Supabase schema mismatch detected. Run the latest SQL in supabase/migrations and supabase/schema.sql.`
      );
    }

    throw new Error(message);
  }

  return data as T;
}

export async function supabaseAdminFetch<T>(path: string, options: RequestInit = {}) {
  const { url } = assertSupabaseConfig();
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role key is not configured.');
  }

  const headers = new Headers(options.headers);
  headers.set('apikey', SUPABASE_SERVICE_ROLE_KEY);
  headers.set('Authorization', `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${url}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data?.error_description || data?.message || data?.msg || 'Supabase admin request failed';
    const schemaMismatch =
      typeof message === 'string' &&
      (message.includes('Could not find') ||
        message.includes('column') ||
        message.includes('schema cache'));

    if (schemaMismatch) {
      throw new Error(
        `${message}. Supabase schema mismatch detected. Run the latest SQL in supabase/migrations and supabase/schema.sql.`
      );
    }

    throw new Error(message);
  }

  return data as T;
}

export async function getCurrentUser(token: string) {
  return supabaseFetch<SupabaseUser>('/auth/v1/user', { token });
}

export async function getProfile(token: string, userId: string) {
  const profiles = await supabaseFetch<
    {
      id: string;
      email: string | null;
      full_name: string | null;
      agency_name: string | null;
      role: string | null;
      plan: string | null;
      subscription_status: string | null;
    }[]
  >(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=*`, { token });

  return profiles[0] ?? null;
}
