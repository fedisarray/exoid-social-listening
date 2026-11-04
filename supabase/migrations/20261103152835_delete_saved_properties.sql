-- Removing a saved property preserves immutable snapshots and shared review evidence.
alter table public.properties add column deleted_at timestamptz;

grant update (deleted_at) on public.properties to authenticated;
create policy properties_update_saved_state on public.properties
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

CREATE OR REPLACE FUNCTION public.list_property_metrics()
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'listing',p.listing,'createdAt',p.created_at,'status',src.status,'collectedAt',snap.created_at,
'reviews',case when snap.id is not null then (select count(*) from public.review_snapshot_items i where i.snapshot_id=snap.id) end,
'ratedCount',case when snap.id is not null then (select count(v.rating) from public.review_snapshot_items i join public.review_revisions v on v.id=i.revision_id where i.snapshot_id=snap.id) end,
'rating',case when snap.id is not null then (select avg(v.rating) from public.review_snapshot_items i join public.review_revisions v on v.id=i.revision_id where i.snapshot_id=snap.id) end,
'ratingTrend',coalesce((select jsonb_agg(jsonb_build_object('bucket',m.bucket,'rating',m.rating,'ratedCount',m.rated_count) order by m.bucket) from (
  select to_char(v.published_at at time zone 'UTC','YYYY-MM') as bucket,avg(v.rating) as rating,count(v.rating) as rated_count
  from public.review_snapshot_items i join public.review_revisions v on v.id=i.revision_id
  where i.snapshot_id=snap.id group by 1
) m),'[]'::jsonb)) order by p.created_at desc),'[]'::jsonb)
from public.properties p
left join lateral (select s.* from public.review_snapshots s where s.property_id=p.id order by created_at desc,id desc limit 1) snap on true
left join public.review_collection_sources src on src.run_id=snap.run_id and src.listing_id=p.source_id
where p.owner_id=auth.uid() and p.deleted_at is null;
$function$;

CREATE OR REPLACE FUNCTION private.freeze_analysis_reviews (
  p_analysis_id uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare a public.analyses; cfg jsonb; item jsonb; p public.properties; snap public.review_snapshots; src public.review_collection_sources; target uuid; frozen uuid; ordinal integer:=0; any_data boolean:=false; all_complete boolean:=true; start_date date; end_date date;
begin
 select * into a from public.analyses where id=p_analysis_id and owner_id=auth.uid() for update;
 if a.id is null then raise exception 'ANALYSIS_NOT_FOUND'; end if;
 select id into target from public.review_collection_runs where analysis_id=a.id and status in ('queued','running');
 if target is not null then return target; end if;
 select config into cfg from public.analysis_versions where analysis_id=a.id and version=a.current_version;
 start_date:=least(date '2022-01-01',(cfg->'period'->>'start')::date);
 end_date:=greatest((cfg->'period'->>'end')::date,(cfg->'period'->>'cutoff')::date);
 insert into public.review_collection_runs(owner_id,analysis_id,analysis_version,config,requested_start,requested_end,max_reviews,status,finished_at)
 values(auth.uid(),a.id,a.current_version,cfg,start_date,end_date,10000,'completed',now()) returning id into target;
 insert into public.review_snapshots(run_id,owner_id,analysis_id,analysis_version,requested_start,requested_end)
 values(target,auth.uid(),a.id,a.current_version,start_date,end_date) returning id into frozen;
 for item in select value from jsonb_array_elements(cfg->'listings') loop
  ordinal:=ordinal+1;
  select * into p from public.properties where owner_id=auth.uid() and source_id=item->>'sourceId' and deleted_at is null;
  select * into snap from public.review_snapshots where property_id=p.id and owner_id=auth.uid() order by created_at desc,id desc limit 1;
  if snap.id is null then
   all_complete:=false;
   insert into public.review_collection_sources(run_id,owner_id,listing_id,listing_url,label,role,ordinal,status,error)
   values(target,auth.uid(),item->>'sourceId',item->>'url',item->>'label',item->>'role',ordinal,'failed','PROPERTY_NOT_COLLECTED');
   continue;
  end if;
  any_data:=true;
  select * into src from public.review_collection_sources where run_id=snap.run_id and listing_id=p.source_id;
  if src.status<>'completed' or snap.requested_start>start_date or snap.requested_end<end_date then all_complete:=false; end if;
  insert into public.review_collection_sources(run_id,owner_id,listing_id,listing_url,label,role,ordinal,status,returned_count,accepted_count,skipped_count,missing_id_count,missing_reviewer_count,duplicate_count,earliest_at,latest_at,capped,error,provider_build_id)
  values(target,auth.uid(),p.source_id,item->>'url',item->>'label',item->>'role',ordinal,
  case when snap.requested_start>start_date or snap.requested_end<end_date then 'partial' else src.status end,
  src.returned_count,src.accepted_count,src.skipped_count,src.missing_id_count,src.missing_reviewer_count,src.duplicate_count,src.earliest_at,src.latest_at,src.capped,
  case when snap.requested_start>start_date or snap.requested_end<end_date then 'PROPERTY_COVERAGE_GAP' else src.error end,src.provider_build_id);
  insert into public.review_snapshot_items(snapshot_id,review_id,revision_id,owner_id)
  select frozen,i.review_id,i.revision_id,i.owner_id from public.review_snapshot_items i join public.review_revisions v on v.id=i.revision_id
  where i.snapshot_id=snap.id and i.owner_id=auth.uid() and v.published_at>=start_date::timestamp at time zone 'UTC' and v.published_at<(end_date+1)::timestamp at time zone 'UTC';
 end loop;
 if not any_data then raise exception 'PROPERTIES_NOT_COLLECTED'; end if;
 update public.review_collection_runs set status=case when all_complete then 'completed' else 'partial' end where id=target;
 return target;
end $function$;

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
 select * into p from public.properties where id=p_property_id and owner_id=auth.uid() and deleted_at is null;
 if p.id is null then raise exception 'PROPERTY_NOT_FOUND'; end if;
 if p_start>p_end then raise exception 'INVALID_PERIOD'; end if;
 cfg:=jsonb_build_object('listings',jsonb_build_array(p.listing||jsonb_build_object('label',p.listing->>'name','role','primary')));
 select id into target from public.review_collection_runs where property_id=p.id and status in ('queued','running');
 if target is not null then return target; end if;
 begin
 insert into public.review_collection_runs(owner_id,property_id,analysis_version,config,requested_start,requested_end,max_reviews)
 values(auth.uid(),p.id,1,cfg,least(date '2022-01-01',p_start),p_end,p_max_reviews) returning id into target;
 exception when unique_violation then
 select id into target from public.review_collection_runs where property_id=p.id and status in ('queued','running'); return target;
 end;
 insert into public.review_collection_sources(run_id,owner_id,listing_id,listing_url,label,role,ordinal)
 values(target,auth.uid(),p.source_id,p.listing->>'url',p.listing->>'name','primary',1);
 return target;
end $function$;

drop policy property_runs_enqueue on public.review_collection_runs;
CREATE POLICY "property_runs_enqueue" ON "public"."review_collection_runs"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((owner_id = ( SELECT auth.uid() AS uid)) AND (analysis_id IS NULL) AND (analysis_version = 1) AND (EXISTS ( SELECT 1
   FROM public.properties p
  WHERE
    ((p.id = review_collection_runs.property_id) AND (p.deleted_at IS NULL) AND (p.owner_id = ( SELECT auth.uid() AS uid)) AND (review_collection_runs.config = jsonb_build_object('listings',
    jsonb_build_array((p.listing || jsonb_build_object('label', (p.listing ->> 'name'::text), 'role', 'primary'))))))))));
