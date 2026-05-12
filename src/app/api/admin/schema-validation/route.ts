import { NextResponse, type NextRequest } from 'next/server';
import { logAdminAction } from '@/lib/adminAudit';
import { requireRoles } from '@/lib/rbac';
import { validateSupabaseSchema } from '@/lib/supabaseSchema';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRoles(request, ['super_admin']);
    if (!auth.ok) return auth.response;
    const result = await validateSupabaseSchema();
    await logAdminAction(request, {
      actorId: auth.user.id,
      actorRole: auth.role,
      action: 'admin.schema_validation.run',
      metadata: { ok: result.ok, missingColumns: result.missingColumns.length },
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to validate Supabase schema.';

    return NextResponse.json({
      ok: false,
      error: message,
      missingColumns: [],
      migrationRequired: true,
    });
  }
}
