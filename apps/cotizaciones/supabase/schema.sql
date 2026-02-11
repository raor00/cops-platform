-- Enable UUID generation
create extension if not exists "pgcrypto";

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  company_format text not null,
  type text not null,
  status text not null default 'borrador',
  issue_date date,
  valid_until date,
  customer_name text,
  total numeric(14,2) default 0,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_notes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  status text not null default 'borrador',
  issue_date date,
  client_name text,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transport_guides (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  status text not null default 'borrador',
  issue_date date,
  authorized_name text,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  description text not null,
  category text not null,
  subcategory text,
  unit text not null,
  unit_price numeric(14,2) not null default 0,
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_discount_config (
  id uuid primary key default gen_random_uuid(),
  enabled boolean not null default false,
  mode text not null default 'percentage',
  value numeric(14,2) not null default 0,
  scope text not null default 'all',
  category text,
  subcategory text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quotations_code on public.quotations(code);
create index if not exists idx_delivery_notes_code on public.delivery_notes(code);
create index if not exists idx_transport_guides_code on public.transport_guides(code);
create index if not exists idx_catalog_items_code on public.catalog_items(code);

-- Update timestamp trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'tr_quotations_updated_at') then
    create trigger tr_quotations_updated_at before update on public.quotations for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'tr_delivery_notes_updated_at') then
    create trigger tr_delivery_notes_updated_at before update on public.delivery_notes for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'tr_transport_guides_updated_at') then
    create trigger tr_transport_guides_updated_at before update on public.transport_guides for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'tr_catalog_items_updated_at') then
    create trigger tr_catalog_items_updated_at before update on public.catalog_items for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'tr_catalog_discount_config_updated_at') then
    create trigger tr_catalog_discount_config_updated_at before update on public.catalog_discount_config for each row execute function public.set_updated_at();
  end if;
end $$;
