-- Accumulated evidence stays separate from immutable report snapshots.
alter table public.review_collection_sources
 add column frozen_coverage jsonb,
 add column provider_start date,
 add column provider_end date;
create table private.property_coverage_requests (
 property_id uuid not null references public.properties(id),
 requested_start date not null,
 requested_end date not null,
 run_id uuid not null references public.review_collection_runs(id),
 primary key(property_id,requested_start,requested_end)
);
alter table private.property_coverage_requests enable row level security;
revoke all on private.property_coverage_requests from public,anon,authenticated;

create function private.property_review_items(p_property uuid,p_snapshots uuid[] default null)
returns table(review_id uuid,revision_id uuid,snapshot_id uuid)
language sql stable set search_path='' as $$
 select distinct on(i.review_id) i.review_id,i.revision_id,s.id
 from public.review_snapshots s join public.review_collection_runs r on r.id=s.run_id
 join public.review_snapshot_items i on i.snapshot_id=s.id
 where s.property_id=p_property and s.owner_id=auth.uid() and r.finished_at is not null
 and r.status in ('completed','partial','failed') and (p_snapshots is null or s.id=any(p_snapshots))
 order by i.review_id,s.created_at desc,s.id desc;
$$;

create function private.property_review_coverage(p_property uuid)
returns datemultirange language sql stable set search_path='' as $$
 select coalesce(range_agg(daterange(coalesce(cs.provider_start,s.requested_start),
 least(coalesce(cs.provider_end,s.requested_end),(s.created_at at time zone 'UTC')::date-1)+1,'[)')),'{}'::datemultirange)
 from public.review_snapshots s join public.review_collection_runs r on r.id=s.run_id
 join public.review_collection_sources cs on cs.run_id=r.id
 where s.property_id=p_property and s.owner_id=auth.uid() and r.finished_at is not null
 and r.status='completed' and cs.status='completed' and cs.provider_status='SUCCEEDED'
 and not cs.capped and cs.skipped_count=0 and cs.missing_id_count=0 and cs.error is null
 and cs.dataset_total is not null and cs.next_offset>=cs.dataset_total
 and coalesce(cs.provider_start,s.requested_start)<=least(coalesce(cs.provider_end,s.requested_end),(s.created_at at time zone 'UTC')::date-1);
$$;

create function private.review_date_intervals(p_ranges datemultirange)
returns jsonb language sql immutable set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('start',lower(r),'end',upper(r)-1) order by lower(r)),'[]'::jsonb)
 from unnest(p_ranges) r;
$$;

create function private.property_review_state(p_property uuid)
returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('propertyId',p.id,'listingId',p.source_id,
 'covered',private.review_date_intervals(private.property_review_coverage(p.id)),
 'sourceSnapshotIds',coalesce((select jsonb_agg(s.id order by s.created_at,s.id)
   from public.review_snapshots s join public.review_collection_runs r on r.id=s.run_id
   where s.property_id=p.id and s.owner_id=auth.uid() and r.finished_at is not null),'[]'::jsonb),
 'activeRun',(select jsonb_build_object('id',r.id,'status',r.status,'createdAt',r.created_at)
   from public.review_collection_runs r where r.property_id=p.id and r.status in ('queued','running') limit 1),
 'collections',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'start',r.requested_start,'end',r.requested_end,
   'collectedAt',r.finished_at,'status',cs.status,'earliest',cs.earliest_at,'latest',cs.latest_at,
   'capped',cs.capped,'skipped',cs.skipped_count,'error',cs.error,'providerStart',coalesce(cs.provider_start,r.requested_start),'providerEnd',cs.provider_end)
   order by r.created_at desc,r.id desc)
   from public.review_collection_runs r join public.review_collection_sources cs on cs.run_id=r.id
   where r.property_id=p.id),'[]'::jsonb))
 from public.properties p where p.id=p_property and p.owner_id=auth.uid();
$$;

-- Both live exploration and frozen reports use the same metric calculations.
create function private.review_metrics(p_revisions uuid[],p_sources jsonb,p_start date,p_end date,p_kind text,p_quarter integer,p_year integer)
returns jsonb language sql stable set search_path='' as $$
with src as(select * from jsonb_to_recordset(p_sources) as x(listing_id text,status text,role text,ordinal integer)),
base as(select r.id,r.listing_id,v.rating,v.published_at,v.original_text,v.original_language,v.reviewer_id,v.review_url
 from public.review_revisions v join public.source_reviews r on r.id=v.review_id
 where v.id=any(p_revisions) and v.owner_id=auth.uid()),
selected as(select * from base where published_at>=p_start::timestamp at time zone 'UTC' and published_at<(p_end+1)::timestamp at time zone 'UTC'),
property_metrics as(select listing_id as "listingId", count(*)::integer as reviews, count(rating)::integer as "ratedCount", avg(rating) as rating, 100.0*count(*) filter(where rating>=4)/nullif(count(rating),0) as satisfaction, count(*) filter(where btrim(original_text)<>'')::integer as "textReviews", count(reviewer_id)::integer as "identifiedReviews", count(distinct reviewer_id)::integer as "identifiedReviewers" from selected group by listing_id),
properties as(select jsonb_build_object('listingId',src.listing_id,'status',src.status,'available',src.status in ('completed','partial') or exists(select 1 from base where listing_id=src.listing_id)) ||
 coalesce((select to_jsonb(m) from property_metrics m where m."listingId"=src.listing_id),jsonb_build_object('reviews',0,'ratedCount',0,'rating',null,'satisfaction',null,'textReviews',0,'identifiedReviews',0,'identifiedReviewers',0)) as data from src order by src.ordinal),
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

create or replace function public.get_review_dashboard_metrics(p_snapshot uuid,p_start date,p_end date,p_kind text,p_quarter integer,p_year integer)
returns jsonb language sql stable set search_path='' as $$
 select private.review_metrics(
 array(select i.revision_id from public.review_snapshot_items i where i.snapshot_id=s.id),
 (select jsonb_agg(jsonb_build_object('listing_id',cs.listing_id,'status',cs.status,'role',cs.role,'ordinal',cs.ordinal))
 from public.review_collection_sources cs where cs.run_id=s.run_id),p_start,p_end,p_kind,p_quarter,p_year)
 from public.review_snapshots s where s.id=p_snapshot and s.owner_id=auth.uid();
$$;

create function public.get_stored_review_dashboard(p_scope uuid,p_property boolean,p_start date,p_end date,p_kind text,p_quarter integer,p_year integer)
returns jsonb language sql stable set search_path='' as $$
 with listings as (
  select p.id as property_id,p.source_id as listing_id,p.listing->>'name' as label,'primary' as role,1 as ordinal
  from public.properties p where p_property and p.id=p_scope and p.owner_id=auth.uid() and p.deleted_at is null
  union all
  select p.id,item->>'sourceId',item->>'label',item->>'role',ord::integer
  from public.analyses a join public.analysis_versions v on v.analysis_id=a.id and v.version=a.current_version
  cross join lateral jsonb_array_elements(v.config->'listings') with ordinality as x(item,ord)
  left join public.properties p on p.source_id=item->>'sourceId' and p.owner_id=auth.uid() and p.deleted_at is null
  where not p_property and a.id=p_scope and a.owner_id=auth.uid()
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

create function public.get_frozen_review_coverage(p_snapshot uuid)
returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(coalesce(cs.frozen_coverage,jsonb_build_object('propertyId',s.property_id,'listingId',cs.listing_id,
 'covered',case when cs.status='completed' and cs.provider_status='SUCCEEDED' and not cs.capped
 and cs.skipped_count=0 and cs.missing_id_count=0 and cs.error is null
 and cs.dataset_total is not null and cs.next_offset>=cs.dataset_total
 and s.requested_start<=least(s.requested_end,(s.created_at at time zone 'UTC')::date-1)
 then jsonb_build_array(jsonb_build_object('start',s.requested_start,'end',least(s.requested_end,(s.created_at at time zone 'UTC')::date-1))) else '[]'::jsonb end,
 'sourceSnapshotIds',jsonb_build_array(s.id),'activeRun',null,'collections','[]'::jsonb))
 ||jsonb_build_object('label',cs.label,'role',cs.role) order by cs.ordinal),'[]'::jsonb)
 from public.review_snapshots s join public.review_collection_sources cs on cs.run_id=s.run_id
 where s.id=p_snapshot and s.owner_id=auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.queue_property_collection (
  p_property_id uuid,
  p_max_reviews integer,
  p_start       date,
  p_end         date
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare p public.properties; target uuid; cfg jsonb;
begin
 select * into p from public.properties where id=p_property_id and owner_id=auth.uid() and deleted_at is null for update;
 if p.id is null then raise exception 'PROPERTY_NOT_FOUND'; end if;
 if p_start>p_end or p_max_reviews<100 or p_max_reviews>10000 then raise exception 'INVALID_PERIOD'; end if;
 if p_start>(now() at time zone 'UTC')::date-1 then raise exception 'FUTURE_PERIOD'; end if;
 cfg:=jsonb_build_object('listings',jsonb_build_array(p.listing||jsonb_build_object('label',p.listing->>'name','role','primary')));
 select id into target from public.review_collection_runs where property_id=p.id and status in ('queued','running');
 if target is not null then return target; end if;
 begin
 insert into public.review_collection_runs(owner_id,property_id,analysis_version,config,requested_start,requested_end,max_reviews)
 values(auth.uid(),p.id,1,cfg,p_start,least(p_end,(now() at time zone 'UTC')::date-1),p_max_reviews) returning id into target;
 exception when unique_violation then
 select id into target from public.review_collection_runs where property_id=p.id and status in ('queued','running'); return target;
 end;
 insert into public.review_collection_sources(run_id,owner_id,listing_id,listing_url,label,role,ordinal)
 values(target,auth.uid(),p.source_id,p.listing->>'url',p.listing->>'name','primary',1);
 return target;
end $function$;


create function private.ensure_comparison_coverage(p_analysis uuid,p_start date,p_end date,p_retry boolean)
returns void language plpgsql security definer set search_path='' as $$
declare cfg jsonb; item jsonb; prop public.properties; missing datemultirange; start_date date;
 end_date date:=least(p_end,(now() at time zone 'UTC')::date-1); target uuid;
begin
 if p_start>p_end then raise exception 'INVALID_PERIOD'; end if;
 select v.config into cfg from public.analyses a join public.analysis_versions v on v.analysis_id=a.id and v.version=a.current_version
 where a.id=p_analysis and a.owner_id=auth.uid();
 if cfg is null then raise exception 'ANALYSIS_NOT_FOUND'; end if;
 if p_start>end_date then return; end if;
 -- Lock in a stable order across comparisons sharing the same properties.
 for item in select value from jsonb_array_elements(cfg->'listings') order by value->>'sourceId' loop
  select * into prop from public.properties where source_id=item->>'sourceId' and owner_id=auth.uid() and deleted_at is null for update;
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
create function public.ensure_comparison_coverage(p_analysis uuid,p_start date,p_end date,p_retry boolean default false)
returns void language sql set search_path='' as $$
 select private.ensure_comparison_coverage(p_analysis,p_start,p_end,p_retry);
$$;

create or replace function private.freeze_analysis_reviews(p_analysis_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare a public.analyses; cfg jsonb; item jsonb; prop public.properties; target uuid; frozen uuid; n integer:=0;
 start_date date; end_date date; state jsonb;
begin
 select * into a from public.analyses where id=p_analysis_id and owner_id=auth.uid() for update;
 if a.id is null then raise exception 'ANALYSIS_NOT_FOUND'; end if;
 select config into cfg from public.analysis_versions where analysis_id=a.id and version=a.current_version;
 start_date:=(cfg->'period'->>'start')::date;
 end_date:=(cfg->'period'->>'end')::date;
 for item in select value from jsonb_array_elements(cfg->'listings') loop
  select * into prop from public.properties where source_id=item->>'sourceId' and owner_id=auth.uid() and deleted_at is null;
  if prop.id is null or not (private.property_review_coverage(prop.id) @> daterange(start_date,end_date+1,'[)')) then
   raise exception 'COMPARISON_COVERAGE_INCOMPLETE';
  end if;
 end loop;
 insert into public.review_collection_runs(owner_id,analysis_id,analysis_version,config,requested_start,requested_end,max_reviews,status,finished_at)
 values(auth.uid(),a.id,a.current_version,cfg,start_date,end_date,10000,'completed',now()) returning id into target;
 insert into public.review_snapshots(run_id,owner_id,analysis_id,analysis_version,requested_start,requested_end)
 values(target,auth.uid(),a.id,a.current_version,start_date,end_date) returning id into frozen;
 for item in select value from jsonb_array_elements(cfg->'listings') loop
  n:=n+1;
  select * into prop from public.properties where source_id=item->>'sourceId' and owner_id=auth.uid() and deleted_at is null;
  state:=private.property_review_state(prop.id);
  -- Capture exactly the revisions selected from finished snapshots, including history for trend panels.
  insert into public.review_snapshot_items(snapshot_id,review_id,revision_id,owner_id)
  select frozen,i.review_id,i.revision_id,auth.uid() from private.property_review_items(prop.id,array(select value::uuid from jsonb_array_elements_text(state->'sourceSnapshotIds'))) i;
  insert into public.review_collection_sources(run_id,owner_id,listing_id,listing_url,label,role,ordinal,status,frozen_coverage)
  values(target,auth.uid(),prop.source_id,item->>'url',item->>'label',item->>'role',n,'completed',
  state||jsonb_build_object('activeRun',null));
 end loop;
 return target;
end;
$$;

revoke all on function private.property_review_items(uuid,uuid[]) from public,anon;
grant execute on function private.property_review_items(uuid,uuid[]) to authenticated;

revoke all on function private.property_review_coverage(uuid) from public,anon;
grant execute on function private.property_review_coverage(uuid) to authenticated;

revoke all on function private.review_date_intervals(datemultirange) from public,anon;
grant execute on function private.review_date_intervals(datemultirange) to authenticated;

revoke all on function private.property_review_state(uuid) from public,anon;
grant execute on function private.property_review_state(uuid) to authenticated;

revoke all on function private.review_metrics(uuid[],jsonb,date,date,text,integer,integer) from public,anon;
grant execute on function private.review_metrics(uuid[],jsonb,date,date,text,integer,integer) to authenticated;

revoke all on function public.get_stored_review_dashboard(uuid,boolean,date,date,text,integer,integer) from public,anon;
grant execute on function public.get_stored_review_dashboard(uuid,boolean,date,date,text,integer,integer) to authenticated;

revoke all on function public.get_frozen_review_coverage(uuid) from public,anon;
grant execute on function public.get_frozen_review_coverage(uuid) to authenticated;

revoke all on function private.ensure_comparison_coverage(uuid,date,date,boolean) from public,anon;
grant execute on function private.ensure_comparison_coverage(uuid,date,date,boolean) to authenticated;

revoke all on function public.ensure_comparison_coverage(uuid,date,date,boolean) from public,anon;
grant execute on function public.ensure_comparison_coverage(uuid,date,date,boolean) to authenticated;

create or replace function public.list_property_metrics()
returns jsonb language sql stable set search_path='' as $$
select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'listing',p.listing,'createdAt',p.created_at,
 'status',src.status,'collectedAt',snap.created_at,
 'collectionPeriod',case when snap.id is not null then jsonb_build_object('start',snap.requested_start,'end',snap.requested_end) end,
 'covered',private.review_date_intervals(private.property_review_coverage(p.id)),
 'reviews',case when snap.id is not null then facts.reviews end,
 'ratedCount',case when snap.id is not null then facts.rated_count end,
 'rating',facts.rating,
 'ratingTrend',coalesce((select jsonb_agg(jsonb_build_object('bucket',m.bucket,'rating',m.rating,'ratedCount',m.rated_count) order by m.bucket) from (
 select to_char(v.published_at at time zone 'UTC','YYYY-MM') as bucket,avg(v.rating) as rating,count(v.rating) as rated_count
 from private.property_review_items(p.id) i join public.review_revisions v on v.id=i.revision_id group by 1
 ) m),'[]'::jsonb)) order by p.created_at desc),'[]'::jsonb)
from public.properties p
left join lateral (select s.* from public.review_snapshots s join public.review_collection_runs r on r.id=s.run_id
 where s.property_id=p.id and r.finished_at is not null order by s.created_at desc,s.id desc limit 1) snap on true
left join public.review_collection_sources src on src.run_id=snap.run_id and src.listing_id=p.source_id
cross join lateral (select count(*) as reviews,count(v.rating) as rated_count,avg(v.rating) as rating
 from private.property_review_items(p.id) i join public.review_revisions v on v.id=i.revision_id) facts
where p.owner_id=auth.uid() and p.deleted_at is null;
$$;

CREATE OR REPLACE FUNCTION public.finish_review_collection (
  p_run_id uuid,
  p_lease  uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare run public.review_collection_runs; snap uuid; final_status text;
begin
 select * into run from public.review_collection_runs where id=p_run_id and lease_token=p_lease and lease_until>now() for update;
 if run.id is null then raise exception 'LEASE_LOST'; end if;
 if exists(select 1 from public.review_collection_sources where run_id=run.id and status not in ('completed','partial','failed')) then return; end if;
 if not exists(select 1 from public.review_collection_sources where run_id=run.id and status in ('completed','partial')) then final_status:='failed';
 else
 final_status:=case when exists(select 1 from public.review_collection_sources where run_id=run.id and status<>'completed') then 'partial' else 'completed' end;
 insert into public.review_snapshots(run_id,owner_id,analysis_id,analysis_version,property_id,requested_start,requested_end)
 values(run.id,run.owner_id,run.analysis_id,run.analysis_version,run.property_id,run.requested_start,run.requested_end) returning id into snap;
 insert into public.review_snapshot_items(snapshot_id,review_id,revision_id,owner_id)
 select snap,r.id,r.current_revision_id,run.owner_id from public.source_reviews r join public.review_revisions v on v.id=r.current_revision_id
 where r.owner_id=run.owner_id and r.listing_id in(select listing_id from public.review_collection_sources where run_id=run.id)
 and v.published_at>=run.requested_start::timestamp at time zone 'UTC'
 and (exists(select 1 from public.review_collection_sources cs where cs.run_id=run.id and cs.provider_start is not null)
 or v.published_at<(run.requested_end+1)::timestamp at time zone 'UTC');
 end if;
 update public.review_collection_runs set status=final_status,finished_at=now(),lease_until=null,lease_token=null where id=run.id;
end; $function$;
