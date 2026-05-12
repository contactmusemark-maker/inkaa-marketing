import { NextResponse, type NextRequest } from 'next/server';
import { logAdminAction } from '@/lib/adminAudit';
import { requireRoles } from '@/lib/rbac';
import { roles, type AppRole } from '@/lib/rbacCore';
import { supabaseAdminFetch } from '@/lib/supabase';

function isRole(value: unknown): value is AppRole {
  return typeof value === 'string' && roles.includes(value as AppRole);
}

export async function GET(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin']);
  if (!auth.ok) return auth.response;

  try {
    const users = await supabaseAdminFetch<
      {
        id: string;
        email: string | null;
        agency_name: string | null;
        full_name: string | null;
        role: string;
        plan: string | null;
        subscription_status: string;
        created_at: string;
      }[]
    >(
      '/rest/v1/profiles?select=id,email,agency_name,full_name,role,plan,subscription_status,created_at&order=created_at.desc&limit=100'
    );
    const auditLogs = await supabaseAdminFetch<
      {
        id: string;
        actor_id: string | null;
        actor_role: string;
        action: string;
        target_user_id: string | null;
        created_at: string;
      }[]
    >(
      '/rest/v1/admin_audit_logs?select=id,actor_id,actor_role,action,target_user_id,created_at&order=created_at.desc&limit=50'
    );

    return NextResponse.json({ users, auditLogs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load users.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin']);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const userId = typeof body.userId === 'string' ? body.userId : '';

    if (!userId) return NextResponse.json({ error: 'userId is required.' }, { status: 400 });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (isRole(body.role)) updates.role = body.role;
    if (typeof body.subscriptionStatus === 'string') {
      updates.subscription_status = body.subscriptionStatus;
    }
    if (typeof body.plan === 'string') updates.plan = body.plan;

    await supabaseAdminFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    await logAdminAction(request, {
      actorId: auth.user.id,
      actorRole: auth.role,
      action: 'admin.user.update',
      targetUserId: userId,
      metadata: updates,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update user.' },
      { status: 500 }
    );
  }
}
