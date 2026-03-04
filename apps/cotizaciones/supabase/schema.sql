-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Enable vector embeddings (pgvector)
create extension if not exists vector;

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

-- AI Knowledge Base (RAG)
create table if not exists public.ai_knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- NOTE: embedding dimension is set to 768 (default for nomic-embed-text).
create table if not exists public.ai_knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.ai_knowledge_documents(id) on delete cascade,
  chunk_text text not null,
  embedding vector(768) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_knowledge_documents_created_at on public.ai_knowledge_documents(created_at desc);
create index if not exists idx_ai_knowledge_chunks_document_id on public.ai_knowledge_chunks(document_id);

-- Vector index (use ivfflat for broader compatibility).
create index if not exists idx_ai_knowledge_chunks_embedding on public.ai_knowledge_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- RPC for similarity search
create or replace function public.match_ai_knowledge_chunks(
  query_embedding vector(768),
  match_count int,
  min_similarity float
)
returns table (
  chunk_text text,
  similarity float
)
language sql stable as $$
  select
    c.chunk_text,
    (1 - (c.embedding <=> query_embedding))::float as similarity
  from public.ai_knowledge_chunks c
  where (1 - (c.embedding <=> query_embedding)) > min_similarity
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

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
