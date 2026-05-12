import { NextResponse, type NextRequest } from 'next/server';
import { formatRole, normalizeRole } from '@/lib/rbacCore';
import { getAuthToken, getCurrentUser, getProfile } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const token = getAuthToken(request);

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const user = await getCurrentUser(token);
    const profile = await getProfile(token, user.id).catch(() => null);
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
        subscriptionStatus: profile?.subscription_status ?? 'trial',
      },
      hasSubscription: profile?.subscription_status === 'active',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load current user.' },
      { status: 401 }
    );
  }
}
