-- Deploy with application writes and collection workers stopped.
-- Personal workspaces become separate organizations; immutable evidence is preserved.
create table public.organizations (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(btrim(name)) between 1 and 120),
 report_template_id text check (report_template_id is null or length(btrim(report_template_id)) between 1 and 128),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.organization_memberships (
 organization_id uuid not null references public.organizations(id) on delete cascade,
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('owner','admin','member')),
 created_at timestamptz not null default now(),
 unique (organization_id,user_id)
);
create unique index organization_one_owner on public.organization_memberships(organization_id) where role='owner';
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
revoke all on public.organizations,public.organization_memberships from public,anon,authenticated;
grant select on public.organizations,public.organization_memberships to authenticated;
grant all on public.organizations,public.organization_memberships to service_role;

-- Own-membership lookup avoids recursive membership RLS and never trusts JWT metadata.
create function private.current_organization_id() returns uuid
language sql stable security definer set search_path='' as $$
 select organization_id from public.organization_memberships where user_id=(select auth.uid());
$$;
revoke all on function private.current_organization_id() from public,anon;
grant usage on schema private to authenticated,service_role;
grant execute on function private.current_organization_id() to authenticated,service_role;
create policy organization_read on public.organizations for select to authenticated
 using(id=(select private.current_organization_id()));
create policy membership_read on public.organization_memberships for select to authenticated
 using(organization_id=(select private.current_organization_id()));

create temporary table organization_backfill (user_id uuid primary key, organization_id uuid not null default gen_random_uuid());
insert into organization_backfill(user_id) select id from auth.users;
insert into public.organizations(id,name)
 select organization_id,'Workspace '||left(user_id::text,8) from organization_backfill;
insert into public.organization_memberships(organization_id,user_id,role)
 select organization_id,user_id,'owner' from organization_backfill;

alter table public.analyses rename column owner_id to created_by;
alter table public.analyses drop constraint analyses_owner_id_fkey;
alter table public.analyses alter column created_by drop not null;
alter table public.analyses alter column created_by set default auth.uid();
alter table public.analyses add constraint analyses_created_by_fkey foreign key(created_by) references auth.users(id) on delete set null;
alter table public.analyses add column organization_id uuid;
update public.analyses t set organization_id=m.organization_id from organization_backfill m where t.created_by=m.user_id;

alter table public.discovery_runs rename column owner_id to created_by;
alter table public.discovery_runs drop constraint discovery_runs_owner_id_fkey;
alter table public.discovery_runs alter column created_by drop not null;
alter table public.discovery_runs alter column created_by set default auth.uid();
alter table public.discovery_runs add constraint discovery_runs_created_by_fkey foreign key(created_by) references auth.users(id) on delete set null;
alter table public.discovery_runs add column organization_id uuid;
update public.discovery_runs t set organization_id=m.organization_id from organization_backfill m where t.created_by=m.user_id;

alter table public.properties rename column owner_id to created_by;
alter table public.properties drop constraint properties_owner_id_fkey;
alter table public.properties alter column created_by drop not null;
alter table public.properties alter column created_by set default auth.uid();
alter table public.properties add constraint properties_created_by_fkey foreign key(created_by) references auth.users(id) on delete set null;
alter table public.properties add column organization_id uuid;
update public.properties t set organization_id=m.organization_id from organization_backfill m where t.created_by=m.user_id;

alter table public.review_collection_runs rename column owner_id to created_by;
alter table public.review_collection_runs drop constraint review_collection_runs_owner_id_fkey;
alter table public.review_collection_runs alter column created_by drop not null;
alter table public.review_collection_runs alter column created_by set default auth.uid();
alter table public.review_collection_runs add constraint review_collection_runs_created_by_fkey foreign key(created_by) references auth.users(id) on delete set null;
alter table public.review_collection_runs add column organization_id uuid;
update public.review_collection_runs t set organization_id=m.organization_id from organization_backfill m where t.created_by=m.user_id;

alter table public.review_collection_sources rename column owner_id to created_by;
alter table public.review_collection_sources drop constraint review_collection_sources_owner_id_fkey;
alter table public.review_collection_sources alter column created_by drop not null;
alter table public.review_collection_sources alter column created_by set default auth.uid();
alter table public.review_collection_sources add constraint review_collection_sources_created_by_fkey foreign key(created_by) references auth.users(id) on delete set null;
alter table public.review_collection_sources add column organization_id uuid;
update public.review_collection_sources t set organization_id=m.organization_id from organization_backfill m where t.created_by=m.user_id;

alter table public.source_reviews rename column owner_id to created_by;
alter table public.source_reviews drop constraint source_reviews_owner_id_fkey;
alter table public.source_reviews alter column created_by drop not null;
alter table public.source_reviews alter column created_by set default auth.uid();
alter table public.source_reviews add constraint source_reviews_created_by_fkey foreign key(created_by) references auth.users(id) on delete set null;
alter table public.source_reviews add column organization_id uuid;
update public.source_reviews t set organization_id=m.organization_id from organization_backfill m where t.created_by=m.user_id;

alter table public.review_revisions rename column owner_id to created_by;
alter table public.review_revisions drop constraint review_revisions_owner_id_fkey;
alter table public.review_revisions alter column created_by drop not null;
alter table public.review_revisions alter column created_by set default auth.uid();
alter table public.review_revisions add constraint review_revisions_created_by_fkey foreign key(created_by) references auth.users(id) on delete set null;
alter table public.review_revisions add column organization_id uuid;
update public.review_revisions t set organization_id=m.organization_id from organization_backfill m where t.created_by=m.user_id;

alter table public.review_snapshots rename column owner_id to created_by;
alter table public.review_snapshots drop constraint review_snapshots_owner_id_fkey;
alter table public.review_snapshots alter column created_by drop not null;
alter table public.review_snapshots alter column created_by set default auth.uid();
alter table public.review_snapshots add constraint review_snapshots_created_by_fkey foreign key(created_by) references auth.users(id) on delete set null;
alter table public.review_snapshots add column organization_id uuid;
update public.review_snapshots t set organization_id=m.organization_id from organization_backfill m where t.created_by=m.user_id;

alter table public.review_snapshot_items rename column owner_id to created_by;
alter table public.review_snapshot_items drop constraint review_snapshot_items_owner_id_fkey;
alter table public.review_snapshot_items alter column created_by drop not null;
alter table public.review_snapshot_items alter column created_by set default auth.uid();
alter table public.review_snapshot_items add constraint review_snapshot_items_created_by_fkey foreign key(created_by) references auth.users(id) on delete set null;
alter table public.review_snapshot_items add column organization_id uuid;
update public.review_snapshot_items t set organization_id=m.organization_id from organization_backfill m where t.created_by=m.user_id;

alter table public.analysis_versions add column organization_id uuid;
update public.analysis_versions v set organization_id=a.organization_id from public.analyses a where a.id=v.analysis_id;
alter table private.property_coverage_requests add column organization_id uuid;
update private.property_coverage_requests r set organization_id=p.organization_id from public.properties p where p.id=r.property_id;
drop table organization_backfill;

alter table public.analyses alter column organization_id set not null;
alter table public.analyses add constraint analyses_organization_fkey foreign key(organization_id) references public.organizations(id);

alter table public.discovery_runs alter column organization_id set not null;
alter table public.discovery_runs add constraint discovery_runs_organization_fkey foreign key(organization_id) references public.organizations(id);

alter table public.properties alter column organization_id set not null;
alter table public.properties add constraint properties_organization_fkey foreign key(organization_id) references public.organizations(id);

alter table public.review_collection_runs alter column organization_id set not null;
alter table public.review_collection_runs add constraint review_collection_runs_organization_fkey foreign key(organization_id) references public.organizations(id);

alter table public.review_collection_sources alter column organization_id set not null;
alter table public.review_collection_sources add constraint review_collection_sources_organization_fkey foreign key(organization_id) references public.organizations(id);

alter table public.source_reviews alter column organization_id set not null;
alter table public.source_reviews add constraint source_reviews_organization_fkey foreign key(organization_id) references public.organizations(id);

alter table public.review_revisions alter column organization_id set not null;
alter table public.review_revisions add constraint review_revisions_organization_fkey foreign key(organization_id) references public.organizations(id);

alter table public.review_snapshots alter column organization_id set not null;
alter table public.review_snapshots add constraint review_snapshots_organization_fkey foreign key(organization_id) references public.organizations(id);

alter table public.review_snapshot_items alter column organization_id set not null;
alter table public.review_snapshot_items add constraint review_snapshot_items_organization_fkey foreign key(organization_id) references public.organizations(id);

alter table public.analysis_versions alter column organization_id set not null;
alter table public.analysis_versions add constraint analysis_versions_organization_fkey foreign key(organization_id) references public.organizations(id);

alter table private.property_coverage_requests alter column organization_id set not null;
alter table private.property_coverage_requests add constraint property_coverage_requests_organization_fkey foreign key(organization_id) references public.organizations(id);

alter table public.analyses alter column organization_id set default private.current_organization_id();

alter table public.discovery_runs alter column organization_id set default private.current_organization_id();

alter table public.properties alter column organization_id set default private.current_organization_id();

alter table public.source_reviews alter column organization_id set default private.current_organization_id();

alter table public.properties drop constraint properties_owner_id_source_id_key;
alter table public.properties add constraint properties_organization_source_key unique(organization_id,source_id);
alter table public.source_reviews drop constraint source_reviews_owner_id_source_source_review_id_key;
alter table public.source_reviews add constraint source_reviews_organization_source_review_key unique(organization_id,source,source_review_id);
drop index public.analyses_owner_updated_idx;
create index analyses_organization_updated_idx on public.analyses(organization_id,updated_at desc);
drop index public.discovery_runs_owner_idx;
create index discovery_runs_organization_idx on public.discovery_runs(organization_id);

alter table public.analyses add constraint analyses_id_organization_key unique(id,organization_id);

alter table public.properties add constraint properties_id_organization_key unique(id,organization_id);

alter table public.review_collection_runs add constraint review_collection_runs_id_organization_key unique(id,organization_id);

alter table public.review_collection_sources add constraint review_collection_sources_id_organization_key unique(id,organization_id);

alter table public.source_reviews add constraint source_reviews_id_organization_key unique(id,organization_id);

alter table public.review_revisions add constraint review_revisions_id_organization_key unique(id,organization_id);

alter table public.review_snapshots add constraint review_snapshots_id_organization_key unique(id,organization_id);

alter table public.analysis_versions add constraint versions_scope_key unique(analysis_id,version,organization_id);
alter table public.review_revisions add constraint revisions_review_scope_key unique(review_id,id,organization_id);

alter table public.analysis_versions drop constraint analysis_versions_analysis_id_fkey;
alter table public.analysis_versions add constraint analysis_versions_analysis_id_fkey foreign key(analysis_id,organization_id) references public.analyses(id,organization_id) on delete cascade;

alter table public.review_collection_runs drop constraint review_collection_runs_analysis_id_analysis_version_fkey;
alter table public.review_collection_runs add constraint review_collection_runs_analysis_id_analysis_version_fkey foreign key(analysis_id,analysis_version,organization_id) references public.analysis_versions(analysis_id,version,organization_id) on delete cascade;

alter table public.review_collection_runs drop constraint review_collection_runs_property_id_fkey;
alter table public.review_collection_runs add constraint review_collection_runs_property_id_fkey foreign key(property_id,organization_id) references public.properties(id,organization_id) on delete no action;

alter table public.review_collection_sources drop constraint review_collection_sources_run_id_fkey;
alter table public.review_collection_sources add constraint review_collection_sources_run_id_fkey foreign key(run_id,organization_id) references public.review_collection_runs(id,organization_id) on delete cascade;

alter table public.review_revisions drop constraint review_revisions_review_id_fkey;
alter table public.review_revisions add constraint review_revisions_review_id_fkey foreign key(review_id,organization_id) references public.source_reviews(id,organization_id) on delete cascade;

alter table public.review_revisions drop constraint review_revisions_collection_source_id_fkey;
alter table public.review_revisions add constraint review_revisions_collection_source_id_fkey foreign key(collection_source_id,organization_id) references public.review_collection_sources(id,organization_id) on delete no action;

alter table public.review_snapshots drop constraint review_snapshots_analysis_id_fkey;
alter table public.review_snapshots add constraint review_snapshots_analysis_id_fkey foreign key(analysis_id,analysis_version,organization_id) references public.analysis_versions(analysis_id,version,organization_id) on delete cascade;

alter table public.review_snapshots drop constraint review_snapshots_property_id_fkey;
alter table public.review_snapshots add constraint review_snapshots_property_id_fkey foreign key(property_id,organization_id) references public.properties(id,organization_id) on delete no action;

alter table public.review_snapshots drop constraint review_snapshots_run_id_fkey;
alter table public.review_snapshots add constraint review_snapshots_run_id_fkey foreign key(run_id,organization_id) references public.review_collection_runs(id,organization_id) on delete cascade;

alter table public.review_snapshot_items drop constraint review_snapshot_items_snapshot_id_fkey;
alter table public.review_snapshot_items add constraint review_snapshot_items_snapshot_id_fkey foreign key(snapshot_id,organization_id) references public.review_snapshots(id,organization_id) on delete cascade;

alter table public.review_snapshot_items drop constraint review_snapshot_items_review_id_fkey;
alter table public.review_snapshot_items add constraint review_snapshot_items_review_id_fkey foreign key(review_id,organization_id) references public.source_reviews(id,organization_id) on delete no action;

alter table public.review_snapshot_items drop constraint review_snapshot_items_revision_id_fkey;
alter table public.review_snapshot_items add constraint review_snapshot_items_revision_id_fkey foreign key(review_id,revision_id,organization_id) references public.review_revisions(review_id,id,organization_id) on delete no action;

alter table public.source_reviews drop constraint source_reviews_current_revision_id_fkey;
alter table public.source_reviews add constraint source_reviews_current_revision_id_fkey foreign key(id,current_revision_id,organization_id) references public.review_revisions(review_id,id,organization_id) on delete no action;

alter table private.property_coverage_requests drop constraint property_coverage_requests_property_id_fkey;
alter table private.property_coverage_requests add constraint property_coverage_requests_property_id_fkey foreign key(property_id,organization_id) references public.properties(id,organization_id) on delete no action;

alter table private.property_coverage_requests drop constraint property_coverage_requests_run_id_fkey;
alter table private.property_coverage_requests add constraint property_coverage_requests_run_id_fkey foreign key(run_id,organization_id) references public.review_collection_runs(id,organization_id) on delete no action;

create function private.keep_resource_organization() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.organization_id is distinct from old.organization_id then raise exception 'ORGANIZATION_IMMUTABLE'; end if;
 return new;
end;
$$;
revoke all on function private.keep_resource_organization() from public,anon,authenticated;

create trigger keep_organization before update on public.analyses for each row execute function private.keep_resource_organization();

create trigger keep_organization before update on public.discovery_runs for each row execute function private.keep_resource_organization();

create trigger keep_organization before update on public.properties for each row execute function private.keep_resource_organization();

create trigger keep_organization before update on public.review_collection_runs for each row execute function private.keep_resource_organization();

create trigger keep_organization before update on public.review_collection_sources for each row execute function private.keep_resource_organization();

create trigger keep_organization before update on public.source_reviews for each row execute function private.keep_resource_organization();

create trigger keep_organization before update on public.review_revisions for each row execute function private.keep_resource_organization();

create trigger keep_organization before update on public.review_snapshots for each row execute function private.keep_resource_organization();

create trigger keep_organization before update on public.review_snapshot_items for each row execute function private.keep_resource_organization();

create trigger keep_organization before update on public.analysis_versions for each row execute function private.keep_resource_organization();

create trigger keep_organization before update on private.property_coverage_requests for each row execute function private.keep_resource_organization();

create function private.scope_analysis_versions() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.organization_id is null then select organization_id into new.organization_id from public.analyses where id=new.analysis_id; end if;
 return new;
end;
$$;
revoke all on function private.scope_analysis_versions() from public,anon,authenticated;
create trigger inherit_organization before insert on public.analysis_versions for each row execute function private.scope_analysis_versions();

create function private.scope_review_collection_runs() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.organization_id is null then if new.analysis_id is not null then
   select organization_id into new.organization_id from public.analyses where id=new.analysis_id;
  else
   select organization_id into new.organization_id from public.properties where id=new.property_id;
  end if; end if;
 return new;
end;
$$;
revoke all on function private.scope_review_collection_runs() from public,anon,authenticated;
create trigger inherit_organization before insert on public.review_collection_runs for each row execute function private.scope_review_collection_runs();

create function private.scope_review_collection_sources() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.organization_id is null then select organization_id into new.organization_id from public.review_collection_runs where id=new.run_id; end if;
 return new;
end;
$$;
revoke all on function private.scope_review_collection_sources() from public,anon,authenticated;
create trigger inherit_organization before insert on public.review_collection_sources for each row execute function private.scope_review_collection_sources();

create function private.scope_review_revisions() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.organization_id is null then select organization_id into new.organization_id from public.source_reviews where id=new.review_id; end if;
 return new;
end;
$$;
revoke all on function private.scope_review_revisions() from public,anon,authenticated;
create trigger inherit_organization before insert on public.review_revisions for each row execute function private.scope_review_revisions();

create function private.scope_review_snapshots() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.organization_id is null then select organization_id into new.organization_id from public.review_collection_runs where id=new.run_id; end if;
 return new;
end;
$$;
revoke all on function private.scope_review_snapshots() from public,anon,authenticated;
create trigger inherit_organization before insert on public.review_snapshots for each row execute function private.scope_review_snapshots();

create function private.scope_review_snapshot_items() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.organization_id is null then select organization_id into new.organization_id from public.review_snapshots where id=new.snapshot_id; end if;
 return new;
end;
$$;
revoke all on function private.scope_review_snapshot_items() from public,anon,authenticated;
create trigger inherit_organization before insert on public.review_snapshot_items for each row execute function private.scope_review_snapshot_items();

create function private.scope_property_coverage_requests() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.organization_id is null then select organization_id into new.organization_id from public.properties where id=new.property_id; end if;
 return new;
end;
$$;
revoke all on function private.scope_property_coverage_requests() from public,anon,authenticated;
create trigger inherit_organization before insert on private.property_coverage_requests for each row execute function private.scope_property_coverage_requests();

-- Existing acquisition and metric operations now use organization scope.

CREATE OR REPLACE FUNCTION private.ensure_comparison_coverage(p_analysis uuid, p_start date, p_end date, p_retry boolean) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare cfg jsonb; item jsonb; prop public.properties; missing datemultirange; start_date date;
 end_date date:=least(p_end,(now() at time zone 'UTC')::date-1); target uuid;
begin
 if p_start>p_end then raise exception 'INVALID_PERIOD'; end if;
 select v.config into cfg from public.analyses a join public.analysis_versions v on v.analysis_id=a.id and v.version=a.current_version
 where a.id=p_analysis and a.organization_id=private.current_organization_id();
 if cfg is null then raise exception 'ANALYSIS_NOT_FOUND'; end if;
 if p_start>end_date then return; end if;
 -- Lock in a stable order across comparisons sharing the same properties.
 for item in select value from jsonb_array_elements(cfg->'listings') order by value->>'sourceId' loop
  select * into prop from public.properties where source_id=item->>'sourceId' and organization_id=private.current_organization_id() and deleted_at is null for update;
  if prop.id is null then continue; end if;
  missing:=datemultirange(daterange(p_start,end_date+1,'[)'))-private.property_review_coverage(prop.id);
  if missing='{}'::datemultirange then continue; end if;
  if exists(select 1 from public.review_collection_runs where property_id=prop.id and status in ('queued','running')) then continue; end if;
  if not p_retry and exists(select 1 from private.property_coverage_requests where property_id=prop.id and requested_start=p_start and requested_end=end_date) then continue; end if;
  select min(lower(r)) into start_date from unnest(missing) r;
  target:=public.queue_property_collection(prop.id,10000,start_date,end_date);
  insert into private.property_coverage_requests(property_id,requested_start,requested_end,run_id)
  values(prop.id,p_start,end_date,target) on conflict(property_id,requested_start,requested_end) do update set run_id=excluded.run_id;
 end loop;
end;
$$;

CREATE OR REPLACE FUNCTION private.freeze_analysis_reviews(p_analysis_id uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare a public.analyses; cfg jsonb; item jsonb; prop public.properties; target uuid; frozen uuid; n integer:=0;
 start_date date; end_date date; state jsonb;
begin
 select * into a from public.analyses where id=p_analysis_id and organization_id=private.current_organization_id() for update;
 if a.id is null then raise exception 'ANALYSIS_NOT_FOUND'; end if;
 select config into cfg from public.analysis_versions where analysis_id=a.id and version=a.current_version;
 start_date:=(cfg->'period'->>'start')::date;
 end_date:=(cfg->'period'->>'end')::date;
 for item in select value from jsonb_array_elements(cfg->'listings') loop
  select * into prop from public.properties where source_id=item->>'sourceId' and organization_id=private.current_organization_id() and deleted_at is null;
  if prop.id is null or not (private.property_review_coverage(prop.id) @> daterange(start_date,end_date+1,'[)')) then
   raise exception 'COMPARISON_COVERAGE_INCOMPLETE';
  end if;
 end loop;
 insert into public.review_collection_runs(organization_id,analysis_id,analysis_version,config,requested_start,requested_end,max_reviews,status,finished_at)
 values(private.current_organization_id(),a.id,a.current_version,cfg,start_date,end_date,10000,'completed',now()) returning id into target;
 insert into public.review_snapshots(run_id,organization_id,analysis_id,analysis_version,requested_start,requested_end)
 values(target,private.current_organization_id(),a.id,a.current_version,start_date,end_date) returning id into frozen;
 for item in select value from jsonb_array_elements(cfg->'listings') loop
  n:=n+1;
  select * into prop from public.properties where source_id=item->>'sourceId' and organization_id=private.current_organization_id() and deleted_at is null;
  state:=private.property_review_state(prop.id);
  -- Capture exactly the revisions selected from finished snapshots, including history for trend panels.
  insert into public.review_snapshot_items(snapshot_id,review_id,revision_id,organization_id)
  select frozen,i.review_id,i.revision_id,private.current_organization_id() from private.property_review_items(prop.id,array(select value::uuid from jsonb_array_elements_text(state->'sourceSnapshotIds'))) i;
  insert into public.review_collection_sources(run_id,organization_id,listing_id,listing_url,label,role,ordinal,status,frozen_coverage)
  values(target,private.current_organization_id(),prop.source_id,item->>'url',item->>'label',item->>'role',n,'completed',
  state||jsonb_build_object('activeRun',null));
 end loop;
 return target;
end;
$$;

CREATE OR REPLACE FUNCTION private.property_review_coverage(p_property uuid) RETURNS datemultirange
    LANGUAGE sql STABLE
    SET search_path TO ''
    AS $$
 select coalesce(range_agg(daterange(coalesce(cs.provider_start,s.requested_start),
 least(coalesce(cs.provider_end,s.requested_end),(s.created_at at time zone 'UTC')::date-1)+1,'[)')),'{}'::datemultirange)
 from public.review_snapshots s join public.review_collection_runs r on r.id=s.run_id
 join public.review_collection_sources cs on cs.run_id=r.id
 where s.property_id=p_property and s.organization_id=private.current_organization_id() and r.finished_at is not null
 and r.status='completed' and cs.status='completed' and cs.provider_status='SUCCEEDED'
 and not cs.capped and cs.skipped_count=0 and cs.missing_id_count=0 and cs.error is null
 and cs.dataset_total is not null and cs.next_offset>=cs.dataset_total
 and coalesce(cs.provider_start,s.requested_start)<=least(coalesce(cs.provider_end,s.requested_end),(s.created_at at time zone 'UTC')::date-1);
$$;

CREATE OR REPLACE FUNCTION private.property_review_items(p_property uuid, p_snapshots uuid[] DEFAULT NULL::uuid[]) RETURNS TABLE(review_id uuid, revision_id uuid, snapshot_id uuid)
    LANGUAGE sql STABLE
    SET search_path TO ''
    AS $$
 select distinct on(i.review_id) i.review_id,i.revision_id,s.id
 from public.review_snapshots s join public.review_collection_runs r on r.id=s.run_id
 join public.review_snapshot_items i on i.snapshot_id=s.id
 where s.property_id=p_property and s.organization_id=private.current_organization_id() and r.finished_at is not null
 and r.status in ('completed','partial','failed') and (p_snapshots is null or s.id=any(p_snapshots))
 order by i.review_id,s.created_at desc,s.id desc;
$$;

CREATE OR REPLACE FUNCTION private.property_review_state(p_property uuid) RETURNS jsonb
    LANGUAGE sql STABLE
    SET search_path TO ''
    AS $$
 select jsonb_build_object('propertyId',p.id,'listingId',p.source_id,
 'covered',private.review_date_intervals(private.property_review_coverage(p.id)),
 'sourceSnapshotIds',coalesce((select jsonb_agg(s.id order by s.created_at,s.id)
   from public.review_snapshots s join public.review_collection_runs r on r.id=s.run_id
   where s.property_id=p.id and s.organization_id=private.current_organization_id() and r.finished_at is not null),'[]'::jsonb),
 'activeRun',(select jsonb_build_object('id',r.id,'status',r.status,'createdAt',r.created_at)
   from public.review_collection_runs r where r.property_id=p.id and r.status in ('queued','running') limit 1),
 'collections',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'start',r.requested_start,'end',r.requested_end,
   'collectedAt',r.finished_at,'status',cs.status,'earliest',cs.earliest_at,'latest',cs.latest_at,
   'capped',cs.capped,'skipped',cs.skipped_count,'error',cs.error,'providerStart',coalesce(cs.provider_start,r.requested_start),'providerEnd',cs.provider_end)
   order by r.created_at desc,r.id desc)
   from public.review_collection_runs r join public.review_collection_sources cs on cs.run_id=r.id
   where r.property_id=p.id),'[]'::jsonb))
 from public.properties p where p.id=p_property and p.organization_id=private.current_organization_id();
$$;

CREATE OR REPLACE FUNCTION private.review_metrics(p_revisions uuid[], p_sources jsonb, p_start date, p_end date, p_kind text, p_quarter integer, p_year integer) RETURNS jsonb
    LANGUAGE sql STABLE
    SET search_path TO ''
    AS $$
with src as(select * from jsonb_to_recordset(p_sources) as x(listing_id text,status text,role text,ordinal integer)),
base as(select r.id,r.listing_id,v.rating,v.published_at,v.original_text,v.original_language,v.reviewer_id,v.review_url
 from public.review_revisions v join public.source_reviews r on r.id=v.review_id
 where v.id=any(p_revisions) and v.organization_id=private.current_organization_id()),
selected as(select * from base where published_at>=p_start::timestamp at time zone 'UTC' and published_at<(p_end+1)::timestamp at time zone 'UTC'),
property_metrics as(select listing_id as "listingId", count(*)::integer as reviews, count(rating)::integer as "ratedCount", avg(rating) as rating, 100.0*count(*) filter(where rating>=4)/nullif(count(rating),0) as satisfaction, count(*) filter(where btrim(original_text)<>'')::integer as "textReviews", count(reviewer_id)::integer as "identifiedReviews", count(distinct reviewer_id)::integer as "identifiedReviewers", jsonb_build_object('1',count(*) filter(where rating=1),'2',count(*) filter(where rating=2),'3',count(*) filter(where rating=3),'4',count(*) filter(where rating=4),'5',count(*) filter(where rating=5)) as "ratingBreakdown" from selected group by listing_id),
properties as(select jsonb_build_object('listingId',src.listing_id,'status',src.status,'available',src.status in ('completed','partial') or exists(select 1 from base where listing_id=src.listing_id)) ||
 coalesce((select to_jsonb(m) from property_metrics m where m."listingId"=src.listing_id),jsonb_build_object('reviews',0,'ratedCount',0,'rating',null,'satisfaction',null,'textReviews',0,'ratingBreakdown',jsonb_build_object('1',0,'2',0,'3',0,'4',0,'5',0),'identifiedReviews',0,'identifiedReviewers',0)) as data from src order by src.ordinal),
monthly as(select listing_id as "listingId",to_char(published_at at time zone 'UTC','YYYY-MM') as bucket,count(*)::integer as reviews, count(rating)::integer as "ratedCount", avg(rating) as rating, 100.0*count(*) filter(where rating>=4)/nullif(count(rating),0) as satisfaction, count(*) filter(where btrim(original_text)<>'')::integer as "textReviews", count(reviewer_id)::integer as "identifiedReviews", count(distinct reviewer_id)::integer as "identifiedReviewers" from selected group by listing_id,bucket order by bucket,listing_id),
annual as(select listing_id as "listingId",extract(year from published_at at time zone 'UTC')::text as bucket,count(*)::integer as reviews, count(rating)::integer as "ratedCount", avg(rating) as rating, 100.0*count(*) filter(where rating>=4)/nullif(count(rating),0) as satisfaction, count(*) filter(where btrim(original_text)<>'')::integer as "textReviews", count(reviewer_id)::integer as "identifiedReviews", count(distinct reviewer_id)::integer as "identifiedReviewers" from base where extract(year from published_at at time zone 'UTC')<extract(year from p_end) group by listing_id,bucket order by bucket,listing_id),
quarters as(select listing_id as "listingId",extract(year from published_at at time zone 'UTC')::text as bucket,count(*)::integer as reviews, count(rating)::integer as "ratedCount", avg(rating) as rating, 100.0*count(*) filter(where rating>=4)/nullif(count(rating),0) as satisfaction, count(*) filter(where btrim(original_text)<>'')::integer as "textReviews", count(reviewer_id)::integer as "identifiedReviews", count(distinct reviewer_id)::integer as "identifiedReviewers" from base where p_kind='quarter' and extract(quarter from published_at at time zone 'UTC')=p_quarter and extract(year from published_at at time zone 'UTC')<=p_year group by listing_id,bucket order by bucket,listing_id),
rolling_dates as(select (date_trunc('month',(p_end+1)::timestamp)-interval '12 months')::date as start_date,(date_trunc('month',(p_end+1)::timestamp)-interval '1 day')::date as end_date),
rolling as(select listing_id as "listingId", count(*)::integer as reviews, count(rating)::integer as "ratedCount", avg(rating) as rating, 100.0*count(*) filter(where rating>=4)/nullif(count(rating),0) as satisfaction, count(*) filter(where btrim(original_text)<>'')::integer as "textReviews", count(reviewer_id)::integer as "identifiedReviews", count(distinct reviewer_id)::integer as "identifiedReviewers" from base cross join rolling_dates d where published_at>=d.start_date::timestamp at time zone 'UTC' and published_at<(d.end_date+1)::timestamp at time zone 'UTC' group by listing_id),
identified as(select distinct on(listing_id,reviewer_id) listing_id,reviewer_id,rating from selected where reviewer_id is not null order by listing_id,reviewer_id,published_at desc,id),
primary_ids as(select i.* from identified i join src on src.listing_id=i.listing_id where src.role='primary'),
competitor_counts as(select src.listing_id,count(i.reviewer_id)::integer as total from src left join identified i on i.listing_id=src.listing_id where src.role='competitor' group by src.listing_id),
shared as(select c.listing_id as "listingId",(select count(*)::integer from primary_ids) as "primaryReviewers",c.total as "competitorReviewers",
 case when c.total=0 or (select count(*) from primary_ids)=0 then null else count(i.reviewer_id)::integer end as shared,
 case when c.total=0 then null else 100.0*count(i.reviewer_id)/nullif((select count(*) from primary_ids),0) end as "primaryShare",
 case when (select count(*) from primary_ids)=0 then null else 100.0*count(i.reviewer_id)/nullif(c.total,0) end as "competitorShare",avg(p.rating) as "primaryRating",avg(i.rating) as "competitorRating"
 from competitor_counts c left join identified i on i.listing_id=c.listing_id and i.reviewer_id in(select reviewer_id from primary_ids)
 left join primary_ids p on p.reviewer_id=i.reviewer_id group by c.listing_id,c.total),
samples as(select listing_id as "listingId",rating,published_at as "publishedAt",original_text as text,original_language as language,review_url as url from selected order by published_at desc,id limit 20)
select jsonb_build_object(
 'properties',coalesce((select jsonb_agg(data) from properties),'[]'::jsonb),
 'monthly',coalesce((select jsonb_agg(to_jsonb(m)) from monthly m),'[]'::jsonb),
 'annual',coalesce((select jsonb_agg(to_jsonb(m)) from annual m),'[]'::jsonb),
 'quarters',coalesce((select jsonb_agg(to_jsonb(m)) from quarters m),'[]'::jsonb),
 'rolling',coalesce((select jsonb_agg(to_jsonb(m)) from rolling m),'[]'::jsonb),
 'rollingStart',(select start_date from rolling_dates),'rollingEnd',(select end_date from rolling_dates),
 'shared',coalesce((select jsonb_agg(to_jsonb(m)) from shared m),'[]'::jsonb),
 'samples',coalesce((select jsonb_agg(to_jsonb(m)) from samples m),'[]'::jsonb)
);

$$;

CREATE OR REPLACE FUNCTION public.finish_review_collection(p_run_id uuid, p_lease uuid) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
declare run public.review_collection_runs; snap uuid; final_status text;
begin
 select * into run from public.review_collection_runs where id=p_run_id and lease_token=p_lease and lease_until>now() for update;
 if run.id is null then raise exception 'LEASE_LOST'; end if;
 if exists(select 1 from public.review_collection_sources where run_id=run.id and status not in ('completed','partial','failed')) then return; end if;
 if not exists(select 1 from public.review_collection_sources where run_id=run.id and status in ('completed','partial')) then final_status:='failed';
 else
 final_status:=case when exists(select 1 from public.review_collection_sources where run_id=run.id and status<>'completed') then 'partial' else 'completed' end;
 insert into public.review_snapshots(run_id,organization_id,analysis_id,analysis_version,property_id,requested_start,requested_end)
 values(run.id,run.organization_id,run.analysis_id,run.analysis_version,run.property_id,run.requested_start,run.requested_end) returning id into snap;
 insert into public.review_snapshot_items(snapshot_id,review_id,revision_id,organization_id)
 select snap,r.id,r.current_revision_id,run.organization_id from public.source_reviews r join public.review_revisions v on v.id=r.current_revision_id
 where r.organization_id=run.organization_id and r.listing_id in(select listing_id from public.review_collection_sources where run_id=run.id)
 and v.published_at>=run.requested_start::timestamp at time zone 'UTC'
 and (exists(select 1 from public.review_collection_sources cs where cs.run_id=run.id and cs.provider_start is not null)
 or v.published_at<(run.requested_end+1)::timestamp at time zone 'UTC');
 end if;
 update public.review_collection_runs set status=final_status,finished_at=now(),lease_until=null,lease_token=null where id=run.id;
end; $$;

CREATE OR REPLACE FUNCTION public.get_frozen_review_coverage(p_snapshot uuid) RETURNS jsonb
    LANGUAGE sql STABLE
    SET search_path TO ''
    AS $$
 select coalesce(jsonb_agg(coalesce(cs.frozen_coverage,jsonb_build_object('propertyId',s.property_id,'listingId',cs.listing_id,
 'covered',case when cs.status='completed' and cs.provider_status='SUCCEEDED' and not cs.capped
 and cs.skipped_count=0 and cs.missing_id_count=0 and cs.error is null
 and cs.dataset_total is not null and cs.next_offset>=cs.dataset_total
 and s.requested_start<=least(s.requested_end,(s.created_at at time zone 'UTC')::date-1)
 then jsonb_build_array(jsonb_build_object('start',s.requested_start,'end',least(s.requested_end,(s.created_at at time zone 'UTC')::date-1))) else '[]'::jsonb end,
 'sourceSnapshotIds',jsonb_build_array(s.id),'activeRun',null,'collections','[]'::jsonb))
 ||jsonb_build_object('label',cs.label,'role',cs.role) order by cs.ordinal),'[]'::jsonb)
 from public.review_snapshots s join public.review_collection_sources cs on cs.run_id=s.run_id
 where s.id=p_snapshot and s.organization_id=private.current_organization_id();
$$;

CREATE OR REPLACE FUNCTION public.get_review_dashboard_metrics(p_snapshot uuid, p_start date, p_end date, p_kind text, p_quarter integer, p_year integer) RETURNS jsonb
    LANGUAGE sql STABLE
    SET search_path TO ''
    AS $$
 select private.review_metrics(
 array(select i.revision_id from public.review_snapshot_items i where i.snapshot_id=s.id),
 (select jsonb_agg(jsonb_build_object('listing_id',cs.listing_id,'status',cs.status,'role',cs.role,'ordinal',cs.ordinal))
 from public.review_collection_sources cs where cs.run_id=s.run_id),p_start,p_end,p_kind,p_quarter,p_year)
 from public.review_snapshots s where s.id=p_snapshot and s.organization_id=private.current_organization_id();
$$;

CREATE OR REPLACE FUNCTION public.get_shared_reviewer_evidence(p_analysis uuid, p_competitor text, p_start date, p_end date, p_offset integer, p_snapshot uuid DEFAULT NULL::uuid) RETURNS jsonb
    LANGUAGE sql STABLE
    SET search_path TO ''
    AS $$
with scope as (
 select a.id from public.analyses a where a.id=p_analysis and a.organization_id=private.current_organization_id()
), snapshot as (
 select s.* from public.review_snapshots s join scope a on a.id=s.analysis_id
 where s.id=p_snapshot and s.organization_id=private.current_organization_id()
), listings as (
 select item->>'sourceId' as listing_id,item->>'role' as role,p.id as property_id
 from scope a join public.analyses current_analysis on current_analysis.id=a.id
 join public.analysis_versions v on v.analysis_id=a.id and v.version=current_analysis.current_version
 cross join lateral jsonb_array_elements(v.config->'listings') item
 left join public.properties p on p.source_id=item->>'sourceId' and p.organization_id=private.current_organization_id() and p.deleted_at is null
 where p_snapshot is null
 union all
 select cs.listing_id,cs.role,null::uuid from snapshot s
 join public.review_collection_sources cs on cs.run_id=s.run_id
), revisions as (
 select i.revision_id from listings l cross join lateral private.property_review_items(l.property_id) i
 where p_snapshot is null
 union
 select i.revision_id from snapshot s join public.review_snapshot_items i on i.snapshot_id=s.id
), identified as (
 select distinct on(r.listing_id,v.reviewer_id)
 r.id,r.listing_id,v.reviewer_id,v.rating,v.published_at,v.original_text,v.original_language,v.review_url
 from revisions i join public.review_revisions v on v.id=i.revision_id
 join public.source_reviews r on r.id=v.review_id
 where v.organization_id=private.current_organization_id() and v.reviewer_id is not null
 and v.published_at>=p_start::timestamp at time zone 'UTC'
 and v.published_at<(p_end+1)::timestamp at time zone 'UTC'
 and r.listing_id in(select listing_id from listings where role='primary' or (role='competitor' and listing_id=p_competitor))
 order by r.listing_id,v.reviewer_id,v.published_at desc,r.id
), pairs as (
 select p.reviewer_id as "reviewerId",
 jsonb_build_object('rating',p.rating,'publishedAt',p.published_at,'text',p.original_text,'language',p.original_language,'url',p.review_url) as "primaryReview",
 jsonb_build_object('rating',c.rating,'publishedAt',c.published_at,'text',c.original_text,'language',c.original_language,'url',c.review_url) as "competitorReview",
 greatest(p.published_at,c.published_at) as latest
 from identified p join listings l on l.listing_id=p.listing_id and l.role='primary'
 join identified c on c.reviewer_id=p.reviewer_id and c.listing_id=p_competitor
 where exists(select 1 from listings where listing_id=p_competitor and role='competitor')
), page as (
 select * from pairs order by latest desc,"reviewerId" limit 20 offset greatest(0,p_offset)
)
select jsonb_build_object('total',(select count(*) from pairs),
 'reviewers',coalesce((select jsonb_agg(jsonb_build_object('reviewerId',"reviewerId",'primaryReview',"primaryReview",'competitorReview',"competitorReview") order by latest desc,"reviewerId") from page),'[]'::jsonb));
$$;

CREATE OR REPLACE FUNCTION public.get_stored_review_dashboard(p_scope uuid, p_property boolean, p_start date, p_end date, p_kind text, p_quarter integer, p_year integer) RETURNS jsonb
    LANGUAGE sql STABLE
    SET search_path TO ''
    AS $$
 with listings as (
  select p.id as property_id,p.source_id as listing_id,p.listing->>'name' as label,'primary' as role,1 as ordinal
  from public.properties p where p_property and p.id=p_scope and p.organization_id=private.current_organization_id() and p.deleted_at is null
  union all
  select p.id,item->>'sourceId',item->>'label',item->>'role',ord::integer
  from public.analyses a join public.analysis_versions v on v.analysis_id=a.id and v.version=a.current_version
  cross join lateral jsonb_array_elements(v.config->'listings') with ordinality as x(item,ord)
  left join public.properties p on p.source_id=item->>'sourceId' and p.organization_id=private.current_organization_id() and p.deleted_at is null
  where not p_property and a.id=p_scope and a.organization_id=private.current_organization_id()
 ), states as (
 select l.*,coalesce(private.property_review_state(l.property_id),jsonb_build_object('propertyId',null,'listingId',l.listing_id,
 'covered','[]'::jsonb,'sourceSnapshotIds','[]'::jsonb,'activeRun',null,'collections','[]'::jsonb))
 ||jsonb_build_object('label',l.label,'role',l.role) as state from listings l
 )
 select jsonb_build_object('coverage',coalesce((select jsonb_agg(state order by ordinal) from states),'[]'::jsonb),
 'metrics',private.review_metrics(
 array(select i.revision_id from listings l cross join lateral private.property_review_items(l.property_id) i),
 (select coalesce(jsonb_agg(jsonb_build_object('listing_id',listing_id,'status',case when property_id is null then 'failed' else 'completed' end,
 'role',role,'ordinal',ordinal)),'[]'::jsonb) from listings),p_start,p_end,p_kind,p_quarter,p_year));
$$;

CREATE OR REPLACE FUNCTION public.ingest_review_page(p_source_id uuid, p_lease uuid, p_offset integer, p_consumed integer, p_reviews jsonb, p_skipped integer, p_missing_ids integer) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
declare src public.review_collection_sources; run public.review_collection_runs; item jsonb; rec public.source_reviews; rev uuid; duplicates integer:=0; accepted integer:=0; skipped integer:=p_skipped; missing_reviewers integer:=0; earliest timestamptz; latest timestamptz;
begin
 select * into src from public.review_collection_sources where id=p_source_id for update;
 select * into run from public.review_collection_runs where id=src.run_id and lease_token=p_lease and lease_until>now();
 if run.id is null then raise exception 'LEASE_LOST'; end if;
 if src.next_offset<>p_offset then return; end if;
 for item in select value from jsonb_array_elements(p_reviews) loop
  select * into rec from public.source_reviews where organization_id=run.organization_id and source='google' and source_review_id=item->>'sourceReviewId';
  if rec.id is null then
   insert into public.source_reviews(organization_id,source_review_id,listing_id) values(run.organization_id,item->>'sourceReviewId',src.listing_id) returning * into rec;
  elsif rec.listing_id<>src.listing_id then skipped:=skipped+1;continue;
  else duplicates:=duplicates+1;
  end if;
  insert into public.review_revisions(review_id,organization_id,content_hash,rating,published_at,original_text,original_language,reviewer_id,review_url,collection_source_id)
  values(rec.id,run.organization_id,item->>'contentHash',(item->>'rating')::smallint,(item->>'publishedAt')::timestamptz,item->>'text',item->>'language',item->>'reviewerId',item->>'url',src.id)
  on conflict(review_id,content_hash) do nothing returning id into rev;
  if rev is null then select id into rev from public.review_revisions where review_id=rec.id and content_hash=item->>'contentHash'; end if;
  update public.source_reviews set current_revision_id=rev,last_collected_at=now() where id=rec.id;
  accepted:=accepted+1;
  if item->>'reviewerId' is null then missing_reviewers:=missing_reviewers+1; end if;
  earliest:=least(earliest,(item->>'publishedAt')::timestamptz);latest:=greatest(latest,(item->>'publishedAt')::timestamptz);
 end loop;
 update public.review_collection_sources set next_offset=next_offset+p_consumed,returned_count=returned_count+p_consumed,
 accepted_count=accepted_count+accepted,duplicate_count=duplicate_count+duplicates,skipped_count=skipped_count+skipped,
 missing_id_count=missing_id_count+p_missing_ids,missing_reviewer_count=missing_reviewer_count+missing_reviewers,
 earliest_at=least(earliest_at,earliest),latest_at=greatest(latest_at,latest),attempts=0,error=null where id=src.id;
end; $$;

CREATE OR REPLACE FUNCTION public.list_property_metrics() RETURNS jsonb
    LANGUAGE sql STABLE
    SET search_path TO ''
    AS $$
select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'listing',p.listing,'createdAt',p.created_at,
 'status',src.status,'collectedAt',snap.created_at,
 'collectionPeriod',case when snap.id is not null then jsonb_build_object('start',snap.requested_start,'end',snap.requested_end) end,
 'covered',private.review_date_intervals(private.property_review_coverage(p.id)),
 'reviews',case when snap.id is not null then facts.reviews end,
 'textReviews',case when snap.id is not null then facts.text_reviews end,
 'ratedCount',case when snap.id is not null then facts.rated_count end,
 'rating',facts.rating,
 'ratingTrend',coalesce((select jsonb_agg(jsonb_build_object('bucket',m.bucket,'rating',m.rating,'reviews',m.reviews,'ratedCount',m.rated_count) order by m.bucket) from (
 select to_char(v.published_at at time zone 'UTC','YYYY-MM') as bucket,avg(v.rating) as rating,count(*) as reviews,count(v.rating) as rated_count
 from private.property_review_items(p.id) i join public.review_revisions v on v.id=i.revision_id group by 1
 ) m),'[]'::jsonb)) order by p.created_at desc),'[]'::jsonb)
from public.properties p
left join lateral (select s.* from public.review_snapshots s join public.review_collection_runs r on r.id=s.run_id
 where s.property_id=p.id and r.finished_at is not null order by s.created_at desc,s.id desc limit 1) snap on true
left join public.review_collection_sources src on src.run_id=snap.run_id and src.listing_id=p.source_id
cross join lateral (select count(*) as reviews,count(v.rating) as rated_count,avg(v.rating) as rating,
 count(*) filter (where btrim(v.original_text) <> '') as text_reviews
 from private.property_review_items(p.id) i join public.review_revisions v on v.id=i.revision_id) facts
where p.organization_id=private.current_organization_id() and p.deleted_at is null;
$$;

CREATE OR REPLACE FUNCTION public.queue_property_collection(p_property_id uuid, p_max_reviews integer, p_start date, p_end date) RETURNS uuid
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
declare p public.properties; target uuid; cfg jsonb;
begin
 select * into p from public.properties where id=p_property_id and organization_id=private.current_organization_id() and deleted_at is null for update;
 if p.id is null then raise exception 'PROPERTY_NOT_FOUND'; end if;
 if p_start>p_end or p_max_reviews<100 or p_max_reviews>10000 then raise exception 'INVALID_PERIOD'; end if;
 if p_start>(now() at time zone 'UTC')::date-1 then raise exception 'FUTURE_PERIOD'; end if;
 cfg:=jsonb_build_object('listings',jsonb_build_array(p.listing||jsonb_build_object('label',p.listing->>'name','role','primary')));
 select id into target from public.review_collection_runs where property_id=p.id and status in ('queued','running');
 if target is not null then return target; end if;
 begin
 insert into public.review_collection_runs(organization_id,property_id,analysis_version,config,requested_start,requested_end,max_reviews)
 values(private.current_organization_id(),p.id,1,cfg,p_start,least(p_end,(now() at time zone 'UTC')::date-1),p_max_reviews) returning id into target;
 exception when unique_violation then
 select id into target from public.review_collection_runs where property_id=p.id and status in ('queued','running'); return target;
 end;
 insert into public.review_collection_sources(run_id,organization_id,listing_id,listing_url,label,role,ordinal)
 values(target,private.current_organization_id(),p.source_id,p.listing->>'url',p.listing->>'name','primary',1);
 return target;
end $$;

CREATE OR REPLACE FUNCTION public.save_analysis(p_id uuid, p_name text, p_config jsonb, p_expected integer) RETURNS uuid
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
declare target uuid; head integer;
begin
 if auth.uid() is null or private.current_organization_id() is null then raise exception 'UNAUTHORIZED'; end if;
 if jsonb_array_length(p_config->'listings')<1 or (select count(*) from jsonb_array_elements(p_config->'listings') item where item->>'role'='primary')<>1 then raise exception 'PRIMARY_REQUIRED'; end if;
 if p_expected=0 then
  insert into public.analyses(id,organization_id,name) values(p_id,private.current_organization_id(),p_name) returning id into target;head:=0;
 else
  select id,current_version into target,head from public.analyses where id=p_id and organization_id=private.current_organization_id() for update;
  if target is null or head<>p_expected then raise exception 'VERSION_CONFLICT'; end if;
 end if;
 insert into public.analysis_versions(analysis_id,version,config) values(target,head+1,p_config);
 update public.analyses set name=p_name,current_version=head+1,updated_at=now() where id=target;
 return target;
end;
$$;

DROP POLICY analyses_insert ON public.analyses;
CREATE POLICY analyses_insert ON public.analyses FOR INSERT TO authenticated WITH CHECK ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY analyses_select ON public.analyses;
CREATE POLICY analyses_select ON public.analyses FOR SELECT TO authenticated USING ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY analyses_update ON public.analyses;
CREATE POLICY analyses_update ON public.analyses FOR UPDATE TO authenticated USING ((organization_id = ( SELECT private.current_organization_id() AS uid))) WITH CHECK ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY collection_runs_read ON public.review_collection_runs;
CREATE POLICY collection_runs_read ON public.review_collection_runs FOR SELECT TO authenticated USING ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY collection_sources_enqueue ON public.review_collection_sources;
CREATE POLICY collection_sources_enqueue ON public.review_collection_sources FOR INSERT TO authenticated WITH CHECK (((organization_id = ( SELECT private.current_organization_id() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.review_collection_runs r,
    LATERAL jsonb_array_elements((r.config -> 'listings'::text)) item(value)
  WHERE ((r.id = review_collection_sources.run_id) AND (r.organization_id = ( SELECT private.current_organization_id() AS uid)) AND (r.property_id IS NOT NULL) AND ((item.value ->> 'sourceId'::text) = review_collection_sources.listing_id) AND ((item.value ->> 'url'::text) = review_collection_sources.listing_url) AND ((item.value ->> 'label'::text) = review_collection_sources.label) AND ((item.value ->> 'role'::text) = review_collection_sources.role))))));

DROP POLICY collection_sources_read ON public.review_collection_sources;
CREATE POLICY collection_sources_read ON public.review_collection_sources FOR SELECT TO authenticated USING ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY discovery_insert ON public.discovery_runs;
CREATE POLICY discovery_insert ON public.discovery_runs FOR INSERT TO authenticated WITH CHECK ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY discovery_select ON public.discovery_runs;
CREATE POLICY discovery_select ON public.discovery_runs FOR SELECT TO authenticated USING ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY discovery_update ON public.discovery_runs;
CREATE POLICY discovery_update ON public.discovery_runs FOR UPDATE TO authenticated USING ((organization_id = ( SELECT private.current_organization_id() AS uid))) WITH CHECK ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY properties_add ON public.properties;
CREATE POLICY properties_add ON public.properties FOR INSERT TO authenticated WITH CHECK (((organization_id = ( SELECT private.current_organization_id() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.discovery_runs d,
    LATERAL jsonb_array_elements(d.results) item(value)
  WHERE ((d.organization_id = ( SELECT private.current_organization_id() AS uid)) AND (d.status = 'completed'::text) AND ((item.value ->> 'sourceId'::text) = properties.source_id) AND (item.value = properties.listing))))));

DROP POLICY properties_read ON public.properties;
CREATE POLICY properties_read ON public.properties FOR SELECT TO authenticated USING ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY properties_update_saved_state ON public.properties;
CREATE POLICY properties_update_saved_state ON public.properties FOR UPDATE TO authenticated USING ((organization_id = ( SELECT private.current_organization_id() AS uid))) WITH CHECK ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY property_runs_enqueue ON public.review_collection_runs;
CREATE POLICY property_runs_enqueue ON public.review_collection_runs FOR INSERT TO authenticated WITH CHECK (((organization_id = ( SELECT private.current_organization_id() AS uid)) AND (analysis_id IS NULL) AND (analysis_version = 1) AND (EXISTS ( SELECT 1
   FROM public.properties p
  WHERE ((p.id = review_collection_runs.property_id) AND (p.deleted_at IS NULL) AND (p.organization_id = ( SELECT private.current_organization_id() AS uid)) AND (review_collection_runs.config = jsonb_build_object('listings', jsonb_build_array((p.listing || jsonb_build_object('label', (p.listing ->> 'name'::text), 'role', 'primary'))))))))));

DROP POLICY review_revisions_read ON public.review_revisions;
CREATE POLICY review_revisions_read ON public.review_revisions FOR SELECT TO authenticated USING ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY review_snapshot_items_read ON public.review_snapshot_items;
CREATE POLICY review_snapshot_items_read ON public.review_snapshot_items FOR SELECT TO authenticated USING ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY review_snapshots_read ON public.review_snapshots;
CREATE POLICY review_snapshots_read ON public.review_snapshots FOR SELECT TO authenticated USING ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY source_reviews_read ON public.source_reviews;
CREATE POLICY source_reviews_read ON public.source_reviews FOR SELECT TO authenticated USING ((organization_id = ( SELECT private.current_organization_id() AS uid)));

DROP POLICY versions_insert ON public.analysis_versions;
CREATE POLICY versions_insert ON public.analysis_versions FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.analyses a
  WHERE ((a.id = analysis_versions.analysis_id) AND (a.organization_id = ( SELECT private.current_organization_id() AS uid))))));

DROP POLICY versions_select ON public.analysis_versions;
CREATE POLICY versions_select ON public.analysis_versions FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.analyses a
  WHERE ((a.id = analysis_versions.analysis_id) AND (a.organization_id = ( SELECT private.current_organization_id() AS uid))))));

-- This earlier repository migration may not yet be installed locally.
drop policy if exists analyses_delete on public.analyses;
create policy analyses_delete on public.analyses for delete to authenticated using(organization_id=(select private.current_organization_id()));
grant delete on public.analyses to authenticated;
-- No direct client can forge the attribution or scope of a new root resource.
create function private.set_resource_creator() returns trigger
language plpgsql set search_path='' as $$
begin
 if auth.uid() is not null then new.created_by:=auth.uid(); end if;
 return new;
end;
$$;
revoke all on function private.set_resource_creator() from public,anon,authenticated;

create trigger set_creator before insert on public.analyses for each row execute function private.set_resource_creator();

create trigger set_creator before insert on public.discovery_runs for each row execute function private.set_resource_creator();

create trigger set_creator before insert on public.properties for each row execute function private.set_resource_creator();

create trigger set_creator before insert on public.review_collection_runs for each row execute function private.set_resource_creator();

create trigger set_creator before insert on public.review_collection_sources for each row execute function private.set_resource_creator();

create trigger set_creator before insert on public.source_reviews for each row execute function private.set_resource_creator();

create trigger set_creator before insert on public.review_revisions for each row execute function private.set_resource_creator();

create trigger set_creator before insert on public.review_snapshots for each row execute function private.set_resource_creator();

create trigger set_creator before insert on public.review_snapshot_items for each row execute function private.set_resource_creator();

drop index public.review_collection_owner_analysis;
create index review_collection_organization_analysis on public.review_collection_runs(organization_id,analysis_id,created_at desc);

drop index public.review_collection_sources_owner;
create index review_collection_sources_organization on public.review_collection_sources(organization_id);

drop index public.review_revisions_owner;
create index review_revisions_organization on public.review_revisions(organization_id);

drop index public.review_snapshot_items_owner;
create index review_snapshot_items_organization on public.review_snapshot_items(organization_id);

drop index public.review_snapshots_owner_analysis;
create index review_snapshots_organization_analysis on public.review_snapshots(organization_id,analysis_id,analysis_version,created_at desc);

drop index public.source_reviews_owner_listing;
create index source_reviews_organization_listing on public.source_reviews(organization_id,listing_id);

-- Internal worker operations must never be callable through a user session.
revoke all on function public.claim_review_collection(),public.ingest_review_page(uuid,uuid,integer,integer,jsonb,integer,integer),public.finish_review_collection(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_review_collection(),public.ingest_review_page(uuid,uuid,integer,integer,jsonb,integer,integer),public.finish_review_collection(uuid,uuid) to service_role;

create trigger keep_organization before update on public.organization_memberships for each row execute function private.keep_resource_organization();

-- Enforce exactly one owner at commit, allowing an atomic transfer between two members.
create function private.require_organization_owner() returns trigger
language plpgsql security definer set search_path='' as $$
declare org uuid;
begin
 if tg_table_name='organizations' then org:=coalesce(new.id,old.id);
 else org:=coalesce(new.organization_id,old.organization_id); end if;
 if exists(select 1 from public.organizations where id=org)
 and (select count(*) from public.organization_memberships where organization_id=org and role='owner')<>1 then
  raise exception 'ORGANIZATION_OWNER_REQUIRED';
 end if;
 return null;
end;
$$;
revoke all on function private.require_organization_owner() from public,anon,authenticated;
create constraint trigger organization_requires_owner after insert or update on public.organizations
 deferrable initially deferred for each row execute function private.require_organization_owner();
create constraint trigger membership_requires_owner after insert or update or delete on public.organization_memberships
 deferrable initially deferred for each row execute function private.require_organization_owner();

-- All management writes lock the organization, then re-read current membership.
-- Definer functions are private; public API functions below are invoker-only wrappers.
create function private.update_organization(p_name text,p_report_template_id text default null) returns void
language plpgsql security definer set search_path='' as $$
declare org uuid:=private.current_organization_id(); actor_role text;
begin
 perform 1 from public.organizations where id=org for update;
 select role into actor_role from public.organization_memberships where user_id=auth.uid() and organization_id=org;
 if auth.uid() is null or actor_role is null or actor_role not in ('owner','admin') then raise exception 'FORBIDDEN'; end if;
 if p_name is null or length(btrim(p_name)) not between 1 and 120
 or (p_report_template_id is not null and length(btrim(p_report_template_id)) not between 1 and 128) then raise exception 'INVALID_SETTINGS'; end if;
 update public.organizations set name=btrim(p_name),report_template_id=case when p_report_template_id is null then null else btrim(p_report_template_id) end,updated_at=now() where id=org;
end;
$$;
create function private.add_organization_member(p_user_id uuid,p_role text) returns void
language plpgsql security definer set search_path='' as $$
declare org uuid:=private.current_organization_id(); actor_role text;
begin
 perform 1 from public.organizations where id=org for update;
 select role into actor_role from public.organization_memberships where user_id=auth.uid() and organization_id=org;
 if auth.uid() is null or actor_role is null or actor_role not in ('owner','admin') then raise exception 'FORBIDDEN'; end if;
 if p_user_id=auth.uid() or p_role is null or p_role not in ('admin','member')
 or (p_role='admin' and actor_role<>'owner') then raise exception 'FORBIDDEN'; end if;
 if not exists(select 1 from auth.users where id=p_user_id) then raise exception 'USER_UNAVAILABLE'; end if;
 begin
  insert into public.organization_memberships(organization_id,user_id,role) values(org,p_user_id,p_role);
 exception when unique_violation then raise exception 'USER_UNAVAILABLE';
 end;
end;
$$;
create function private.change_organization_member_role(p_user_id uuid,p_role text) returns void
language plpgsql security definer set search_path='' as $$
declare org uuid:=private.current_organization_id(); actor_role text; target_role text;
begin
 perform 1 from public.organizations where id=org for update;
 select role into actor_role from public.organization_memberships where user_id=auth.uid() and organization_id=org;
 if auth.uid() is null or actor_role is null or actor_role not in ('owner','admin') then raise exception 'FORBIDDEN'; end if;
 select role into target_role from public.organization_memberships where user_id=p_user_id and organization_id=org;
 if target_role is null then raise exception 'MEMBER_NOT_FOUND'; end if;
 if p_user_id=auth.uid() or target_role='owner' or p_role is null or p_role not in ('admin','member')
 or (actor_role<>'owner' and (target_role<>'member' or p_role<>'member')) then raise exception 'FORBIDDEN'; end if;
 update public.organization_memberships set role=p_role where user_id=p_user_id and organization_id=org;
end;
$$;
create function private.remove_organization_member(p_user_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare org uuid:=private.current_organization_id(); actor_role text; target_role text;
begin
 perform 1 from public.organizations where id=org for update;
 select role into actor_role from public.organization_memberships where user_id=auth.uid() and organization_id=org;
 if auth.uid() is null or actor_role is null or actor_role not in ('owner','admin') then raise exception 'FORBIDDEN'; end if;
 select role into target_role from public.organization_memberships where user_id=p_user_id and organization_id=org;
 if target_role is null then raise exception 'MEMBER_NOT_FOUND'; end if;
 if p_user_id=auth.uid() or target_role='owner' or (actor_role<>'owner' and target_role<>'member') then raise exception 'FORBIDDEN'; end if;
 delete from public.organization_memberships where user_id=p_user_id and organization_id=org;
end;
$$;
create function private.transfer_organization_ownership(p_user_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare org uuid:=private.current_organization_id(); actor_role text;
begin
 perform 1 from public.organizations where id=org for update;
 select role into actor_role from public.organization_memberships where user_id=auth.uid() and organization_id=org;
 if auth.uid() is null or actor_role is distinct from 'owner' or p_user_id=auth.uid() then raise exception 'FORBIDDEN'; end if;
 if not exists(select 1 from public.organization_memberships where user_id=p_user_id and organization_id=org) then raise exception 'MEMBER_NOT_FOUND'; end if;
 update public.organization_memberships set role='admin' where user_id=auth.uid() and organization_id=org;
 update public.organization_memberships set role='owner' where user_id=p_user_id and organization_id=org;
end;
$$;

-- Only administrative provisioning can create an organization, with its initial owner atomically.
create function private.provision_organization(p_user_id uuid,p_name text) returns uuid
language plpgsql set search_path='' as $$
declare org uuid;
begin
 if exists(select 1 from public.organization_memberships where user_id=p_user_id) then raise exception 'USER_UNAVAILABLE'; end if;
 insert into public.organizations(name) values(p_name) returning id into org;
 insert into public.organization_memberships(organization_id,user_id,role) values(org,p_user_id,'owner');
 return org;
end;
$$;
create function public.provision_organization(p_user_id uuid,p_name text) returns uuid
language sql set search_path='' as $$ select private.provision_organization(p_user_id,p_name); $$;
revoke all on function private.provision_organization(uuid,text),public.provision_organization(uuid,text) from public,anon,authenticated;
grant execute on function private.provision_organization(uuid,text),public.provision_organization(uuid,text) to service_role;

create function public.update_organization(p_name text,p_report_template_id text default null) returns void
language sql set search_path='' as $$ select private.update_organization(p_name,p_report_template_id); $$;
revoke all on function private.update_organization(text,text),public.update_organization(text,text) from public,anon;
grant execute on function private.update_organization(text,text),public.update_organization(text,text) to authenticated;

create function public.add_organization_member(p_user_id uuid,p_role text) returns void
language sql set search_path='' as $$ select private.add_organization_member(p_user_id,p_role); $$;
revoke all on function private.add_organization_member(uuid,text),public.add_organization_member(uuid,text) from public,anon;
grant execute on function private.add_organization_member(uuid,text),public.add_organization_member(uuid,text) to authenticated;

create function public.change_organization_member_role(p_user_id uuid,p_role text) returns void
language sql set search_path='' as $$ select private.change_organization_member_role(p_user_id,p_role); $$;
revoke all on function private.change_organization_member_role(uuid,text),public.change_organization_member_role(uuid,text) from public,anon;
grant execute on function private.change_organization_member_role(uuid,text),public.change_organization_member_role(uuid,text) to authenticated;

create function public.remove_organization_member(p_user_id uuid) returns void
language sql set search_path='' as $$ select private.remove_organization_member(p_user_id); $$;
revoke all on function private.remove_organization_member(uuid),public.remove_organization_member(uuid) from public,anon;
grant execute on function private.remove_organization_member(uuid),public.remove_organization_member(uuid) to authenticated;

create function public.transfer_organization_ownership(p_user_id uuid) returns void
language sql set search_path='' as $$ select private.transfer_organization_ownership(p_user_id); $$;
revoke all on function private.transfer_organization_ownership(uuid),public.transfer_organization_ownership(uuid) from public,anon;
grant execute on function private.transfer_organization_ownership(uuid),public.transfer_organization_ownership(uuid) to authenticated;

-- Resource attribution and organization cannot be rewritten through the Data API.
revoke update on public.analyses,public.discovery_runs from authenticated;
grant update(name,current_version,updated_at) on public.analyses to authenticated;
grant update(provider_run_id,status,results,error) on public.discovery_runs to authenticated;
