import { NextResponse, type NextRequest } from 'next/server';
import { isTicketPriority, isTicketStatus } from '@/lib/support';
import { requireRoles } from '@/lib/rbac';
import { getAuthToken, getCurrentUser, supabaseAdminFetch } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin']);
  if (!auth.ok) return auth.response;

  try {
    const [tickets, feedback] = await Promise.all([
      supabaseAdminFetch('/rest/v1/support_tickets?select=*&order=created_at.desc&limit=100').catch(
        () => []
      ),
      supabaseAdminFetch(
        '/rest/v1/feedback_submissions?select=*&order=created_at.desc&limit=50'
      ).catch(() => []),
    ]);

    return NextResponse.json({ tickets, feedback });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load support tickets.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin']);
  if (!auth.ok) return auth.response;

  const token = getAuthToken(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const user = await getCurrentUser(token);
    const body = await request.json();
    const ticketId = typeof body.ticketId === 'string' ? body.ticketId : '';
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket id is required.' }, { status: 400 });
    }
    if (body.status !== undefined) {
      if (!isTicketStatus(body.status)) {
        return NextResponse.json({ error: 'Invalid ticket status.' }, { status: 400 });
      }
      updates.status = body.status;
      if (body.status === 'Resolved' || body.status === 'Closed') {
        updates.resolved_at = new Date().toISOString();
      }
    }
    if (body.priority !== undefined) {
      if (!isTicketPriority(body.priority)) {
        return NextResponse.json({ error: 'Invalid ticket priority.' }, { status: 400 });
      }
      updates.priority = body.priority;
    }
    if (typeof body.internalReply === 'string') {
      updates.internal_reply = body.internalReply.trim();
      updates.replied_by = user.id;
      updates.replied_at = new Date().toISOString();
    }

    await supabaseAdminFetch(`/rest/v1/support_tickets?id=eq.${encodeURIComponent(ticketId)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update support ticket.' },
      { status: 500 }
    );
  }
}
