import { NextResponse, type NextRequest } from 'next/server';
import { logAdminAction } from '@/lib/adminAudit';
import { requireRoles } from '@/lib/rbac';
import { supabaseAdminFetch } from '@/lib/supabase';

type ProfileRow = {
  id: string;
  email: string | null;
};

type GenerateLinkResponse = {
  action_link?: string;
  email_otp?: string;
  hashed_token?: string;
};

export async function POST(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin']);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const userId = typeof body.userId === 'string' ? body.userId : '';

    if (!userId) return NextResponse.json({ error: 'userId is required.' }, { status: 400 });

    const profiles = await supabaseAdminFetch<ProfileRow[]>(
      `/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,email`
    );
    const target = profiles[0];

    if (!target?.email) {
      return NextResponse.json(
        { error: 'Target user does not have an email stored in their profile.' },
        { status: 400 }
      );
    }

    const link = await supabaseAdminFetch<GenerateLinkResponse>('/auth/v1/admin/generate_link', {
      method: 'POST',
      body: JSON.stringify({
        type: 'magiclink',
        email: target.email,
      }),
    });
    await logAdminAction(request, {
      actorId: auth.user.id,
      actorRole: auth.role,
      action: 'admin.impersonation.create_link',
      targetUserId: target.id,
      metadata: { targetEmail: target.email },
    });

    return NextResponse.json({
      impersonationLink: link.action_link,
      targetUserId: target.id,
      expiresNotice: 'Use immediately. Supabase controls link expiry.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create impersonation link.' },
      { status: 500 }
    );
  }
}
