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

## Creating the products table in Supabase

1. Open your [Supabase](https://supabase.com) project.
2. Go to **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Paste the SQL below and click **Run**.

### SQL to run

```sql
-- Table for shopping app products (no RLS required; backend uses service role)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_usdc numeric(12, 6),
  created_at timestamptz not null default now()
);

-- Enable RLS but do not add policies (service role bypasses RLS anyway)
alter table public.products enable row level security;
```

You can leave RLS enabled on the table; the service role key bypasses it, so no policies are required for this backend.

## Creating the orders table in Supabase

1. Open your [Supabase](https://supabase.com) project.
2. Go to **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Paste the SQL below and click **Run**.

### SQL to run

```sql
-- Enum for order status (backend uses service role)
create type public.order_status as enum (
  'PENDING',
  'PAID',
);

-- Table for orders (one order per product)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  customer_email text not null,
  price_usdc numeric(12, 6) not null,
  status public.order_status not null default 'PENDING',
  source_wallet_address text not null,
  payment_detected_at timestamptz,
  payment_tx_hash text,
  created_at timestamptz not null default now()
);

-- Enable RLS but do not add policies (service role bypasses RLS anyway)
alter table public.orders enable row level security;
```

You can leave RLS enabled on the table; the service role key bypasses it, so no policies are required for this backend.
