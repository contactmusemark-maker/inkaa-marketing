import { NextResponse, type NextRequest } from 'next/server';
import { getAuthToken, getCurrentUser, getProfile } from '@/lib/supabase';
import { normalizeRole, type AppRole } from '@/lib/rbacCore';

export async function getRequestRole(request: NextRequest) {
  const token = getAuthToken(request);
  if (!token) return null;

  const user = await getCurrentUser(token);
  const profile = await getProfile(token, user.id);

  return {
    token,
    user,
    profile,
    role: normalizeRole(profile?.role),
  };
}

export async function requireRoles(request: NextRequest, allowedRoles: AppRole[]) {
  const context = await getRequestRole(request);
  if (!context) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Not authenticated.' }, { status: 401 }),
    };
  }

  if (!allowedRoles.includes(context.role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'You do not have permission for this action.' },
        { status: 403 }
      ),
    };
  }

  return { ok: true as const, ...context };
}
