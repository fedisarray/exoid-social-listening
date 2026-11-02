create table public.analyses (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (length(name) between 1 and 120), current_version integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index analyses_owner_updated_idx on public.analyses(owner_id,updated_at desc);
create table public.analysis_versions (
 id uuid primary key default gen_random_uuid(), analysis_id uuid not null references public.analyses(id) on delete cascade,
 version integer not null check(version>0), config jsonb not null, created_at timestamptz not null default now(),
 unique(analysis_id,version)
);
create table public.discovery_runs (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 input jsonb not null, provider_run_id text, status text not null check(status in ('queued','running','completed','failed')),
 results jsonb not null default '[]'::jsonb, error text, created_at timestamptz not null default now()
);
create index discovery_runs_owner_idx on public.discovery_runs(owner_id);
alter table public.analyses enable row level security;
alter table public.analysis_versions enable row level security;
alter table public.discovery_runs enable row level security;
create policy analyses_select on public.analyses for select to authenticated using(owner_id=(select auth.uid()));
create policy analyses_insert on public.analyses for insert to authenticated with check(owner_id=(select auth.uid()));
create policy analyses_update on public.analyses for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy versions_select on public.analysis_versions for select to authenticated using(exists(select 1 from public.analyses a where a.id=analysis_id and a.owner_id=(select auth.uid())));
create policy versions_insert on public.analysis_versions for insert to authenticated with check(exists(select 1 from public.analyses a where a.id=analysis_id and a.owner_id=(select auth.uid())));
create policy discovery_select on public.discovery_runs for select to authenticated using(owner_id=(select auth.uid()));
create policy discovery_insert on public.discovery_runs for insert to authenticated with check(owner_id=(select auth.uid()));
create policy discovery_update on public.discovery_runs for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
revoke all on public.analyses,public.analysis_versions,public.discovery_runs from anon,authenticated;
grant select,insert,update on public.analyses,public.discovery_runs to authenticated;
grant select,insert on public.analysis_versions to authenticated;
create function public.save_analysis(p_id uuid,p_name text,p_config jsonb,p_expected integer) returns uuid
language plpgsql security invoker set search_path='' as $$
declare target uuid; head integer;
begin
 if auth.uid() is null then raise exception 'UNAUTHORIZED'; end if;
 if jsonb_array_length(p_config->'listings')<1 or (select count(*) from jsonb_array_elements(p_config->'listings') item where item->>'role'='primary')<>1 then raise exception 'PRIMARY_REQUIRED'; end if;
 if p_expected=0 then
  insert into public.analyses(id,owner_id,name) values(p_id,auth.uid(),p_name) returning id into target;head:=0;
 else
  select id,current_version into target,head from public.analyses where id=p_id and owner_id=auth.uid() for update;
  if target is null or head<>p_expected then raise exception 'VERSION_CONFLICT'; end if;
 end if;
 insert into public.analysis_versions(analysis_id,version,config) values(target,head+1,p_config);
 update public.analyses set name=p_name,current_version=head+1,updated_at=now() where id=target;
 return target;
end;
$$;
revoke all on function public.save_analysis(uuid,text,jsonb,integer) from public,anon;
grant execute on function public.save_analysis(uuid,text,jsonb,integer) to authenticated;
