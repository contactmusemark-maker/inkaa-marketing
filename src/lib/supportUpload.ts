import { supabaseAdminFetch } from '@/lib/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'support-screenshots';

export async function uploadSupportScreenshot(userId: string, file: File | null) {
  if (!file || !SUPABASE_URL || !SERVICE_KEY) return null;
  if (!file.type.startsWith('image/')) return null;
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Screenshot must be 5MB or smaller.');
  }

  await supabaseAdminFetch('/storage/v1/bucket', {
    method: 'POST',
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: false,
      file_size_limit: 5242880,
      allowed_mime_types: ['image/png', 'image/jpeg', 'image/webp'],
    }),
  }).catch(() => null);

  const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': file.type,
      'x-upsert': 'true',
    },
    body: await file.arrayBuffer(),
    cache: 'no-store',
  });

  if (!response.ok) return null;

  return `${BUCKET}/${path}`;
}
