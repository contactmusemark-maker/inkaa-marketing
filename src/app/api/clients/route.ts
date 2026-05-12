import { NextResponse, type NextRequest } from 'next/server';
import { requireRoles } from '@/lib/rbac';
import { getAuthToken, getCurrentUser, supabaseFetch } from '@/lib/supabase';

type ClientRow = {
  id: string;
  owner_id: string;
  contact_name: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  manager: string;
  mrr: number;
  projects: number;
  status: string;
  plan: string;
  last_contact: string | null;
  joined_date: string | null;
  tags: string[] | null;
  city: string;
};

function toClient(row: ClientRow) {
  return {
    id: row.id,
    name: row.contact_name,
    company: row.company,
    industry: row.industry,
    email: row.email,
    phone: row.phone,
    manager: row.manager,
    mrr: row.mrr ?? 0,
    projects: row.projects ?? 0,
    status: row.status,
    plan: row.plan,
    lastContact: row.last_contact ?? '',
    joinedDate: row.joined_date ?? '',
    tags: row.tags ?? [],
    city: row.city,
  };
}

function toRow(body: Record<string, unknown>, ownerId: string) {
  return {
    owner_id: ownerId,
    contact_name: body.name,
    company: body.company,
    industry: body.industry,
    email: body.email,
    phone: body.phone,
    manager: body.manager,
    mrr: body.mrr ?? 0,
    projects: body.projects ?? 0,
    status: body.status ?? 'Active',
    plan: body.plan ?? 'Starter',
    last_contact: body.lastContact ?? new Date().toISOString().slice(0, 10),
    joined_date: body.joinedDate ?? new Date().toISOString().slice(0, 10),
    tags: body.tags ?? [],
    city: body.city,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin', 'admin', 'manager', 'member']);
  if (!auth.ok) return auth.response;

  const token = getAuthToken(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const rows = await supabaseFetch<ClientRow[]>(
      '/rest/v1/clients?select=*&order=created_at.desc',
      { token }
    );
    return NextResponse.json({ clients: rows.map(toClient) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load clients.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin', 'admin', 'manager', 'member']);
  if (!auth.ok) return auth.response;

  const token = getAuthToken(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const user = await getCurrentUser(token);
    const body = await request.json();
    const rows = await supabaseFetch<ClientRow[]>('/rest/v1/clients?select=*', {
      method: 'POST',
      token,
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(toRow(body, user.id)),
    });

    return NextResponse.json({ client: toClient(rows[0]) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create client.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin', 'admin', 'manager']);
  if (!auth.ok) return auth.response;

  const token = getAuthToken(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const { id, ...body } = await request.json();
    if (!id) return NextResponse.json({ error: 'Client id is required.' }, { status: 400 });

    const payload: Record<string, unknown> = {};
    if (body.status) payload.status = body.status;

    const rows = await supabaseFetch<ClientRow[]>(
      `/rest/v1/clients?id=eq.${encodeURIComponent(id)}&select=*`,
      {
        method: 'PATCH',
        token,
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(payload),
      }
    );

    return NextResponse.json({ client: toClient(rows[0]) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update client.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin', 'admin']);
  if (!auth.ok) return auth.response;

  const token = getAuthToken(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Client id is required.' }, { status: 400 });

    await supabaseFetch(`/rest/v1/clients?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      token,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to delete client.' },
      { status: 500 }
    );
  }
}
