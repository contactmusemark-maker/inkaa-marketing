import type { NextRequest } from 'next/server';
import type { AppRole } from '@/lib/rbacCore';
import { supabaseAdminFetch } from '@/lib/supabase';

type AuditPayload = {
  actorId: string;
  actorRole: AppRole;
  action: string;
  targetUserId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAdminAction(request: NextRequest, payload: AuditPayload) {
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;
  const userAgent = request.headers.get('user-agent');

  await supabaseAdminFetch('/rest/v1/admin_audit_logs', {
    method: 'POST',
    body: JSON.stringify({
      actor_id: payload.actorId,
      actor_role: payload.actorRole,
      action: payload.action,
      target_user_id: payload.targetUserId || null,
      metadata: payload.metadata || {},
      ip_address: ipAddress,
      user_agent: userAgent,
    }),
  }).catch(() => null);
}
