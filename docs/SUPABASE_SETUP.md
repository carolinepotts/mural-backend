# Supabase setup reference

This backend uses a **service role** client, so Row Level Security (RLS) is bypassed. You do not need to add RLS policies for backend-only access.

## Creating the test table in Supabase

1. Open your [Supabase](https://supabase.com) project.
2. Go to **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Paste the SQL below and click **Run**.

### SQL to run

```sql
-- Table for backend test read/write endpoints (no RLS required; backend uses service role)
create table if not exists public.test_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS but do not add policies (service role bypasses RLS anyway)
alter table public.test_items enable row level security;
```

You can leave RLS enabled on the table; the service role key bypasses it, so no policies are required for this backend.

## Environment variables

Set these in your `.env` (see `.env.example` in the repo root):

- **SUPABASE_URL** — Project URL from Supabase: **Project Settings → API**.
- **SUPABASE_SERVICE_ROLE_KEY** — The **service_role** secret under **Project Settings → API → Project API keys**. Never expose this to the frontend.
