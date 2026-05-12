# Supabase Setup

Run `supabase/schema.sql` in the Supabase SQL Editor for a fresh setup.

For existing projects, run migrations in order from `supabase/migrations/`.

Current production validation:

- `supabase/migrations/202605130001_align_app_schema.sql` adds every table/column used by the app.
- It also creates `public.validate_inkaa_schema()`.
- Admins can call `/api/admin/schema-validation` after deployment to verify that required columns exist.

The validation endpoint requires `SUPABASE_SERVICE_ROLE_KEY` in the server environment. Never expose that key to the browser.
