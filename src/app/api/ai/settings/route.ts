import { NextResponse, type NextRequest } from 'next/server';
import { getProviderStatus } from '@/lib/ai/providers';
import { requireRoles } from '@/lib/rbac';
import { getAuthToken } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin', 'admin']);
  if (!auth.ok) return auth.response;

  const token = getAuthToken(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const providerStatus = getProviderStatus();

  return NextResponse.json({
    enabled: process.env.AI_TOOLS_ENABLED !== 'false',
    ...providerStatus,
    defaultProvider: process.env.AI_PROVIDER || 'auto',
    hourlyLimit: 25,
  });
}
