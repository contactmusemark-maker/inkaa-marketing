import { supabaseAdminFetch } from '@/lib/supabase';

export type MissingSchemaColumn = {
  missing_table: string;
  missing_column: string;
};

export async function validateSupabaseSchema() {
  const missingColumns = await supabaseAdminFetch<MissingSchemaColumn[]>(
    '/rest/v1/rpc/validate_inkaa_schema',
    {
      method: 'POST',
      body: JSON.stringify({}),
    }
  );

  return {
    ok: missingColumns.length === 0,
    missingColumns,
  };
}
