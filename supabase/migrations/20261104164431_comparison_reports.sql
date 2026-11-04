-- PowerPoint generation jobs and immutable, organization-scoped report versions.
alter table public.review_snapshots add constraint review_snapshots_report_scope_key unique(id,analysis_id,analysis_version,organization_id);
create table public.comparison_reports (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 analysis_id uuid not null,
 analysis_version integer not null,
 snapshot_id uuid not null,
 period jsonb not null,
 locale text not null check(locale in ('it','en')),
 template_id text not null check(length(btrim(template_id)) between 1 and 128),
 metric_definition_version integer not null default 1 check(metric_definition_version=1),
 frozen_data jsonb not null,
 status text not null default 'queued' check(status in ('queued','starting','generating','downloading','completed','failed','cancelled')),
 provider_generation_id text,
 provider_export_url text,
 storage_path text,
 native_charts boolean not null default false,
 error_code text,
 attempts integer not null default 0,
 lease_token uuid,
 lease_until timestamptz,
 next_attempt_at timestamptz not null default now(),
 created_by uuid default auth.uid() references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 finished_at timestamptz,
 foreign key(analysis_id,analysis_version,organization_id) references public.analysis_versions(analysis_id,version,organization_id) on delete cascade,
 foreign key(snapshot_id,analysis_id,analysis_version,organization_id) references public.review_snapshots(id,analysis_id,analysis_version,organization_id) on delete cascade,
 check(status<>'completed' or (storage_path is not null and finished_at is not null)),
 check(status not in ('generating','downloading','completed') or provider_generation_id is not null)
);
create unique index comparison_report_one_active on public.comparison_reports(analysis_id) where status in ('queued','starting','generating','downloading');
create index comparison_report_history on public.comparison_reports(organization_id,analysis_id,created_at desc);
create index comparison_report_queue on public.comparison_reports(next_attempt_at) where status in ('queued','starting','generating','downloading');
alter table public.comparison_reports enable row level security;
revoke all on public.comparison_reports from public,anon,authenticated;
grant select on public.comparison_reports to authenticated;
grant all on public.comparison_reports to service_role;
create policy comparison_report_read on public.comparison_reports for select to authenticated
 using(organization_id=(select private.current_organization_id()));
create function private.keep_report_input() returns trigger
language plpgsql set search_path='' as $$
begin
 if old.status='completed' and (to_jsonb(new)-'created_by') is distinct from (to_jsonb(old)-'created_by') then raise exception 'REPORT_IMMUTABLE'; end if;
 if (to_jsonb(new)-array['status','provider_generation_id','provider_export_url','storage_path','native_charts','error_code','attempts','lease_token','lease_until','next_attempt_at','updated_at','finished_at','created_by'])
 is distinct from (to_jsonb(old)-array['status','provider_generation_id','provider_export_url','storage_path','native_charts','error_code','attempts','lease_token','lease_until','next_attempt_at','updated_at','finished_at','created_by']) then raise exception 'REPORT_IMMUTABLE'; end if;
 return new;
end;
$$;
revoke all on function private.keep_report_input() from public,anon,authenticated;
create trigger keep_report_input before update on public.comparison_reports for each row execute function private.keep_report_input();
CREATE OR REPLACE FUNCTION private.freeze_report_dataset(p_analysis_id uuid,p_period jsonb,p_options jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare a public.analyses; cfg jsonb; item jsonb; prop public.properties; target uuid; frozen uuid; n integer:=0;
 start_date date; end_date date; state jsonb;
begin
 select * into a from public.analyses where id=p_analysis_id and organization_id=private.current_organization_id() for update;
 if a.id is null then raise exception 'ANALYSIS_NOT_FOUND'; end if;
 select config into cfg from public.analysis_versions where analysis_id=a.id and version=a.current_version;
 if exists(select 1 from jsonb_array_elements_text(p_options->'listingIds') chosen where not exists(select 1 from jsonb_array_elements(cfg->'listings') place where place->>'sourceId'=chosen)) then raise exception 'INVALID_SELECTION'; end if;
 cfg:=jsonb_set(cfg,'{listings}',(select jsonb_agg(x.item order by x.ord) from jsonb_array_elements(cfg->'listings') with ordinality x(item,ord) where x.item->>'sourceId' in(select jsonb_array_elements_text(p_options->'listingIds'))));
 cfg:=jsonb_set(cfg,'{period}',p_period);
 start_date:=(p_period->>'start')::date;
 end_date:=(p_period->>'end')::date;
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


revoke all on function private.freeze_report_dataset(uuid,jsonb,jsonb) from public,anon,authenticated;

-- Freeze data and enqueue in one transaction. Caller identity and template are resolved here.
create function private.enqueue_comparison_report(p_analysis uuid,p_expected integer,p_period jsonb,p_locale text,p_options jsonb,p_snapshot uuid default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare a public.analyses; snap public.review_snapshots; org uuid:=private.current_organization_id();
 template text; active uuid; frozen_run uuid; coverage jsonb; metrics jsonb; shared_l12m jsonb; target uuid;
 start_date date:=(p_period->>'start')::date; end_date date:=(p_period->>'end')::date;
begin
 if auth.uid() is null or org is null then raise exception 'UNAUTHORIZED'; end if;
 if p_locale is null or p_locale not in ('it','en') or start_date is null or end_date is null or start_date>end_date
 or end_date>=(now() at time zone 'UTC')::date then raise exception 'INVALID_PERIOD'; end if;
 select * into a from public.analyses where id=p_analysis and organization_id=org for update;
 if a.id is null then raise exception 'ANALYSIS_NOT_FOUND'; end if;
 select report_template_id into template from public.organizations where id=org;
 if template is null then raise exception 'TEMPLATE_NOT_CONFIGURED'; end if;
 select id into active from public.comparison_reports where analysis_id=a.id and status in ('queued','starting','generating','downloading');
 if active is not null then return active; end if;
 if p_snapshot is null then
  if a.current_version<>p_expected then raise exception 'CONFIGURATION_CHANGED'; end if;
  frozen_run:=private.freeze_report_dataset(a.id,p_period,p_options);
  select * into snap from public.review_snapshots where review_snapshots.run_id=frozen_run;
 else
  select * into snap from public.review_snapshots where id=p_snapshot and analysis_id=a.id and organization_id=org;
  if snap.id is null then raise exception 'SNAPSHOT_NOT_FOUND'; end if;
 end if;
 coverage:=public.get_frozen_review_coverage(snap.id);
 if exists(select 1 from jsonb_array_elements_text(p_options->'listingIds') chosen where not exists(select 1 from jsonb_array_elements(coverage) place where place->>'listingId'=chosen)) then raise exception 'INVALID_SELECTION'; end if;
 coverage:=(select coalesce(jsonb_agg(place),'[]'::jsonb) from jsonb_array_elements(coverage) place where place->>'listingId' in(select jsonb_array_elements_text(p_options->'listingIds')));
 if jsonb_array_length(coverage)=0 or exists(
  select 1 from jsonb_array_elements(coverage) place where not (
   coalesce((select range_agg(daterange((r->>'start')::date,(r->>'end')::date+1,'[)'))
   from jsonb_array_elements(place->'covered') r),'{}'::datemultirange) @> daterange(start_date,end_date+1,'[)')
  )
 ) then raise exception 'COVERAGE_INCOMPLETE'; end if;
 if p_options is null or jsonb_array_length(p_options->'listingIds') not between 1 and 30
 or jsonb_array_length(p_options->'sheets') not between 1 and 7 or (p_options->>'historyYears')::integer not between 0 and 20
 or exists(select 1 from jsonb_array_elements_text(p_options->'listingIds') chosen where not exists(select 1 from jsonb_array_elements(coverage) place where place->>'listingId'=chosen))
 or exists(select 1 from jsonb_array_elements_text(p_options->'sheets') chosen where chosen not in ('reviews','rating','quarterRating','satisfaction','quarterSatisfaction','anchorRating','anchorSatisfaction')) then raise exception 'INVALID_SELECTION'; end if;
 p_options:=p_options||jsonb_build_object('includeCharts',true);
 metrics:=public.get_review_dashboard_metrics(snap.id,start_date,end_date,p_period->>'kind',(p_period->>'quarter')::integer,(p_period->>'year')::integer)-'samples';
 shared_l12m:=jsonb_build_object('start',metrics->>'rollingStart','end',metrics->>'rollingEnd','available',false,'rows','[]'::jsonb);
 if not exists(select 1 from jsonb_array_elements(coverage) place where not (
  coalesce((select range_agg(daterange((r->>'start')::date,(r->>'end')::date+1,'[)')) from jsonb_array_elements(place->'covered') r),'{}'::datemultirange)
  @> daterange((metrics->>'rollingStart')::date,(metrics->>'rollingEnd')::date+1,'[)')
 )) then
  shared_l12m:=shared_l12m||jsonb_build_object('available',true,'rows',public.get_review_dashboard_metrics(snap.id,(metrics->>'rollingStart')::date,(metrics->>'rollingEnd')::date,'l12m',(p_period->>'quarter')::integer,(p_period->>'year')::integer)->'shared');
 end if;
 insert into public.comparison_reports(organization_id,analysis_id,analysis_version,snapshot_id,period,locale,template_id,frozen_data)
 values(org,a.id,snap.analysis_version,snap.id,p_period,p_locale,template,jsonb_build_object(
 'name',a.name,'snapshot',jsonb_build_object('id',snap.id,'version',snap.analysis_version,'createdAt',snap.created_at,'start',snap.requested_start,'end',snap.requested_end),
 'coverage',coverage,'metrics',metrics,'sharedL12M',shared_l12m,'exportOptions',p_options)) returning id into target;
 return target;
end;
$$;
create function public.enqueue_comparison_report(p_analysis uuid,p_expected integer,p_period jsonb,p_locale text,p_options jsonb,p_snapshot uuid default null) returns uuid
language sql set search_path='' as $$ select private.enqueue_comparison_report(p_analysis,p_expected,p_period,p_locale,p_options,p_snapshot); $$;
revoke all on function private.enqueue_comparison_report(uuid,integer,jsonb,text,jsonb,uuid),public.enqueue_comparison_report(uuid,integer,jsonb,text,jsonb,uuid) from public,anon;
grant execute on function private.enqueue_comparison_report(uuid,integer,jsonb,text,jsonb,uuid),public.enqueue_comparison_report(uuid,integer,jsonb,text,jsonb,uuid) to authenticated;

create function public.claim_comparison_report() returns setof public.comparison_reports
language sql set search_path='' as $$
 update public.comparison_reports set lease_token=gen_random_uuid(),lease_until=now()+interval '90 seconds',updated_at=now()
 where id=(select id from public.comparison_reports where status in ('queued','starting','generating','downloading')
 and next_attempt_at<=now() and (lease_until is null or lease_until<now())
 order by next_attempt_at,created_at for update skip locked limit 1) returning *;
$$;
revoke all on function public.claim_comparison_report() from public,anon,authenticated;
grant execute on function public.claim_comparison_report() to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('comparison-reports','comparison-reports',false,33554432,array['application/vnd.openxmlformats-officedocument.presentationml.presentation']);
create policy comparison_report_file_read on storage.objects for select to authenticated using(
 bucket_id='comparison-reports' and exists(select 1 from public.comparison_reports r
 where r.organization_id=(select private.current_organization_id()) and r.status='completed' and r.storage_path=name)
);
create function private.cancel_comparison_report(p_report uuid) returns boolean
language plpgsql security definer set search_path='' as $$
declare target public.comparison_reports;
begin
 if auth.uid() is null or private.current_organization_id() is null then return false; end if;
 select * into target from public.comparison_reports where id=p_report and organization_id=private.current_organization_id() for update;
 if target.id is null or target.status in ('completed','failed') then return false; end if;
 if target.status='cancelled' then return true; end if;
 update public.comparison_reports set status='cancelled',finished_at=now(),updated_at=now(),lease_token=null,lease_until=null,error_code=null where id=target.id;
 return true;
end;
$$;
create function public.cancel_comparison_report(p_report uuid) returns boolean
language sql set search_path='' as $$ select private.cancel_comparison_report(p_report); $$;
revoke all on function private.cancel_comparison_report(uuid),public.cancel_comparison_report(uuid) from public,anon;
grant execute on function private.cancel_comparison_report(uuid),public.cancel_comparison_report(uuid) to authenticated;
