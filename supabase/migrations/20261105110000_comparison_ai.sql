create table public.comparison_ai_imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default private.current_organization_id(),
  analysis_id uuid not null,
  analysis_version integer not null,
  file_name text not null check (length(btrim(file_name)) between 1 and 255),
  import_kind text not null check (import_kind in ('review_rows','aggregate_only')),
  row_count integer not null default 0 check (row_count >= 0),
  aggregate_content jsonb,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (analysis_id, analysis_version, organization_id)
    references public.analysis_versions (analysis_id, version, organization_id) on delete cascade,
  check ((import_kind = 'review_rows' and aggregate_content is null) or import_kind = 'aggregate_only')
);
alter table public.comparison_ai_imports enable row level security;
revoke all on public.comparison_ai_imports from public, anon;
grant select, insert on public.comparison_ai_imports to authenticated;
grant all on public.comparison_ai_imports to service_role;
create policy comparison_ai_imports_read on public.comparison_ai_imports for select to authenticated
  using (organization_id = (select private.current_organization_id()));
create policy comparison_ai_imports_insert on public.comparison_ai_imports for insert to authenticated
  with check (organization_id = (select private.current_organization_id()));

create table public.comparison_ai_reviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  import_id uuid not null,
  sheet_name text not null,
  row_number integer not null check (row_number > 0),
  listing_id text,
  listing_label text,
  published_at date,
  rating smallint check (rating is null or rating between 1 and 5),
  review_text text not null,
  language text,
  source_url text,
  unique (import_id, sheet_name, row_number),
  unique (id, import_id, organization_id),
  foreign key (import_id, organization_id)
    references public.comparison_ai_imports (id, organization_id) on delete cascade
);
alter table public.comparison_ai_reviews enable row level security;
revoke all on public.comparison_ai_reviews from public, anon;
grant select, insert on public.comparison_ai_reviews to authenticated;
grant all on public.comparison_ai_reviews to service_role;
create policy comparison_ai_reviews_read on public.comparison_ai_reviews for select to authenticated
  using (organization_id = (select private.current_organization_id()));
create policy comparison_ai_reviews_insert on public.comparison_ai_reviews for insert to authenticated
  with check (organization_id = (select private.current_organization_id()));
create index comparison_ai_reviews_scope_idx on public.comparison_ai_reviews(import_id, published_at, listing_id);

create function public.create_comparison_ai_import(
  p_analysis uuid,
  p_file_name text,
  p_kind text,
  p_reviews jsonb,
  p_aggregate jsonb
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  org uuid := private.current_organization_id();
  version_number integer;
  import_id uuid;
begin
  select current_version into version_number from public.analyses
  where id = p_analysis and organization_id = org;
  if version_number is null then raise exception 'SCOPE_NOT_FOUND'; end if;
  insert into public.comparison_ai_imports(
    organization_id, analysis_id, analysis_version, file_name, import_kind, row_count, aggregate_content
  ) values (
    org, p_analysis, version_number, p_file_name, p_kind,
    case when p_kind = 'review_rows' then jsonb_array_length(p_reviews) else 0 end,
    p_aggregate
  ) returning id into import_id;
  if p_kind = 'review_rows' then
    insert into public.comparison_ai_reviews(
      organization_id, import_id, sheet_name, row_number, listing_id, listing_label,
      published_at, rating, review_text, language, source_url
    )
    select org, import_id, sheet_name, row_number, listing_id, listing_label,
      published_at, rating, review_text, language, source_url
    from jsonb_to_recordset(p_reviews) as r(
      sheet_name text, row_number integer, listing_id text, listing_label text,
      published_at date, rating smallint, review_text text, language text, source_url text
    );
  end if;
  return import_id;
end;
$$;
revoke all on function public.create_comparison_ai_import(uuid,text,text,jsonb,jsonb) from public, anon;
grant execute on function public.create_comparison_ai_import(uuid,text,text,jsonb,jsonb) to authenticated;

create table public.comparison_ai_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  analysis_id uuid not null,
  import_id uuid not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  locale text not null default 'it' check (locale in ('it','en')),
  citations jsonb not null default '[]'::jsonb,
  visualization jsonb,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now(),
  foreign key (analysis_id, organization_id)
    references public.analyses (id, organization_id) on delete cascade,
  foreign key (import_id, organization_id)
    references public.comparison_ai_imports (id, organization_id) on delete cascade,
  check (period_start <= period_end)
);
alter table public.comparison_ai_messages enable row level security;
revoke all on public.comparison_ai_messages from public, anon;
grant select, insert on public.comparison_ai_messages to authenticated;
grant all on public.comparison_ai_messages to service_role;
create policy comparison_ai_messages_read on public.comparison_ai_messages for select to authenticated
  using (organization_id = (select private.current_organization_id()));
create policy comparison_ai_messages_insert on public.comparison_ai_messages for insert to authenticated
  with check (organization_id = (select private.current_organization_id()));
create policy comparison_ai_messages_update on public.comparison_ai_messages for update to authenticated
  using (organization_id = (select private.current_organization_id()))
  with check (organization_id = (select private.current_organization_id()));
create index comparison_ai_messages_thread_idx on public.comparison_ai_messages(import_id, created_at);

create table public.comparison_ai_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  analysis_id uuid not null,
  import_id uuid not null,
  message_id uuid not null references public.comparison_ai_messages(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  visualization_type text not null check (visualization_type in ('sentiment','themes','sentiment_trend','listing_comparison','word_cloud')),
  status text not null default 'queued' check (status in ('queued','running','completed','failed')),
  processed_count integer not null default 0 check (processed_count >= 0),
  total_count integer not null default 0 check (total_count >= 0),
  error_code text,
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  lease_token uuid,
  lease_until timestamptz,
  next_attempt_at timestamptz not null default now(),
  foreign key (analysis_id, organization_id)
    references public.analyses (id, organization_id) on delete cascade,
  foreign key (import_id, organization_id)
    references public.comparison_ai_imports (id, organization_id) on delete cascade,
  check (period_start <= period_end)
);
alter table public.comparison_ai_jobs enable row level security;
revoke all on public.comparison_ai_jobs from public, anon;
grant select, insert on public.comparison_ai_jobs to authenticated;
grant all on public.comparison_ai_jobs to service_role;
create policy comparison_ai_jobs_read on public.comparison_ai_jobs for select to authenticated
  using (organization_id = (select private.current_organization_id()));
create policy comparison_ai_jobs_insert on public.comparison_ai_jobs for insert to authenticated
  with check (organization_id = (select private.current_organization_id()));
create index comparison_ai_jobs_queue_idx on public.comparison_ai_jobs(status, next_attempt_at, created_at);

create function public.enqueue_comparison_ai_job(
  p_analysis uuid, p_import uuid, p_message uuid, p_start date, p_end date,
  p_type text, p_total integer
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  org uuid := private.current_organization_id();
  job_id uuid;
begin
  if p_start > p_end then raise exception 'INVALID_PERIOD'; end if;
  if not exists (select 1 from public.analyses where id=p_analysis and organization_id=org)
    or not exists (select 1 from public.comparison_ai_imports where id=p_import and analysis_id=p_analysis and organization_id=org)
    or not exists (select 1 from public.comparison_ai_messages where id=p_message and import_id=p_import and analysis_id=p_analysis and organization_id=org)
  then raise exception 'SCOPE_NOT_FOUND'; end if;
  insert into public.comparison_ai_jobs(
    organization_id, analysis_id, import_id, message_id, period_start, period_end,
    visualization_type, total_count
  ) values (org,p_analysis,p_import,p_message,p_start,p_end,p_type,greatest(0,p_total))
  returning id into job_id;
  return job_id;
end;
$$;
revoke all on function public.enqueue_comparison_ai_job(uuid,uuid,uuid,date,date,text,integer) from public, anon;
grant execute on function public.enqueue_comparison_ai_job(uuid,uuid,uuid,date,date,text,integer) to authenticated;

create table public.comparison_ai_annotations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  import_id uuid not null,
  review_id uuid not null,
  model_version text not null,
  sentiment text not null check (sentiment in ('positive','negative','mixed','unclassified')),
  themes text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (import_id, review_id, model_version),
  foreign key (import_id, organization_id)
    references public.comparison_ai_imports (id, organization_id) on delete cascade,
  foreign key (review_id, import_id, organization_id)
    references public.comparison_ai_reviews (id, import_id, organization_id) on delete cascade
);
alter table public.comparison_ai_annotations enable row level security;
revoke all on public.comparison_ai_annotations from public, anon;
grant select on public.comparison_ai_annotations to authenticated;
grant all on public.comparison_ai_annotations to service_role;
create policy comparison_ai_annotations_read on public.comparison_ai_annotations for select to authenticated
  using (organization_id = (select private.current_organization_id()));
create policy comparison_ai_annotations_insert on public.comparison_ai_annotations for insert to authenticated
  with check (organization_id = (select private.current_organization_id()));

create function public.claim_comparison_ai_job()
returns setof public.comparison_ai_jobs
language sql
set search_path = ''
as $$
  update public.comparison_ai_jobs
  set status = 'running', lease_token = gen_random_uuid(), lease_until = now() + interval '120 seconds'
  where id = (
    select id from public.comparison_ai_jobs
    where status in ('queued','running') and next_attempt_at <= now()
      and (lease_until is null or lease_until < now())
    order by next_attempt_at, created_at
    for update skip locked limit 1
  )
  returning *;
$$;
revoke all on function public.claim_comparison_ai_job() from public, anon, authenticated;
grant execute on function public.claim_comparison_ai_job() to service_role;
