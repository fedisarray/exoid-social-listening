SET local check_function_bodies = off;

DROP FUNCTION "public"."queue_review_collection"(uuid, integer);

CREATE SCHEMA "private";

CREATE TABLE "public"."properties" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "owner_id"   uuid                     NOT NULL,
  "source_id"  text                     NOT NULL,
  "listing"    jsonb                    NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "properties_check" CHECK ((((listing ->> 'source'::text) = 'google'::text) AND ((listing ->> 'sourceId'::text) = source_id))),
  CONSTRAINT "properties_owner_id_source_id_key" UNIQUE (owner_id, source_id),
  CONSTRAINT "properties_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."properties"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."properties" FROM "anon";

ALTER TABLE "public"."review_collection_runs"
  ADD COLUMN "property_id" uuid;

ALTER TABLE "public"."review_snapshots"
  ADD COLUMN "property_id" uuid;

ALTER TABLE "public"."review_collection_runs"
  ALTER COLUMN "analysis_id" DROP NOT NULL;

ALTER TABLE "public"."review_snapshots"
  ALTER COLUMN "analysis_id" DROP NOT NULL;

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
 select config into cfg from public.analysis_versions where analysis_id=a.id and version=a.current_version;
 start_date:=least(date '2022-01-01',(cfg->'period'->>'start')::date);
 end_date:=greatest((cfg->'period'->>'end')::date,(cfg->'period'->>'cutoff')::date);
 insert into public.review_collection_runs(owner_id,analysis_id,analysis_version,config,requested_start,requested_end,max_reviews,status,finished_at)
 values(auth.uid(),a.id,a.current_version,cfg,start_date,end_date,10000,'completed',now()) returning id into target;
 insert into public.review_snapshots(run_id,owner_id,analysis_id,analysis_version,requested_start,requested_end)
 values(target,auth.uid(),a.id,a.current_version,start_date,end_date) returning id into frozen;
 for item in select value from jsonb_array_elements(cfg->'listings') loop
  ordinal:=ordinal+1;
  select * into p from public.properties where owner_id=auth.uid() and source_id=item->>'sourceId';
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
 and v.published_at>=run.requested_start::timestamp at time zone 'UTC' and v.published_at<(run.requested_end+1)::timestamp at time zone 'UTC';
 end if;
 update public.review_collection_runs set status=final_status,finished_at=now(),lease_until=null,lease_token=null where id=run.id;
end; $function$;

CREATE OR REPLACE FUNCTION public.list_property_metrics()
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'listing',p.listing,'createdAt',p.created_at,'status',src.status,'collectedAt',snap.created_at,
'reviews',case when snap.id is not null then (select count(*) from public.review_snapshot_items i where i.snapshot_id=snap.id) end,
'ratedCount',case when snap.id is not null then (select count(v.rating) from public.review_snapshot_items i join public.review_revisions v on v.id=i.revision_id where i.snapshot_id=snap.id) end,
'rating',case when snap.id is not null then (select avg(v.rating) from public.review_snapshot_items i join public.review_revisions v on v.id=i.revision_id where i.snapshot_id=snap.id) end) order by p.created_at desc),'[]'::jsonb)
from public.properties p
left join lateral (select s.* from public.review_snapshots s where s.property_id=p.id order by created_at desc,id desc limit 1) snap on true
left join public.review_collection_sources src on src.run_id=snap.run_id and src.listing_id=p.source_id
where p.owner_id=auth.uid();
$function$;

REVOKE ALL ON FUNCTION "public"."list_property_metrics"() FROM PUBLIC, "anon";

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
 select * into p from public.properties where id=p_property_id and owner_id=auth.uid();
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

REVOKE ALL ON FUNCTION "public"."queue_property_collection"(uuid, integer, date, date) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.queue_review_collection (
  p_analysis_id uuid,
  p_max_reviews integer
)
  RETURNS uuid
  LANGUAGE sql
  SET search_path TO ''
  AS $function$
 select private.freeze_analysis_reviews(p_analysis_id);
$function$;

REVOKE ALL ON FUNCTION "public"."queue_review_collection"(uuid, integer) FROM PUBLIC, "anon";

ALTER TABLE "public"."properties"
  ADD CONSTRAINT "properties_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."review_collection_runs"
  ADD CONSTRAINT "collection_scope" CHECK (((analysis_id IS NULL) <> (property_id IS NULL)));

ALTER TABLE "public"."review_collection_runs"
  ADD CONSTRAINT "review_collection_runs_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id);

ALTER TABLE "public"."review_snapshots"
  ADD CONSTRAINT "review_snapshots_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id);

ALTER TABLE "public"."review_snapshots"
  ADD CONSTRAINT "snapshot_scope" CHECK (((analysis_id IS NULL) <> (property_id IS NULL)));

CREATE UNIQUE INDEX property_collection_one_active ON public.review_collection_runs USING btree (property_id)
  WHERE (status = ANY (ARRAY['queued'::text, 'running'::text]));

CREATE INDEX property_runs ON public.review_collection_runs USING btree (property_id, created_at DESC);

CREATE INDEX property_snapshots ON public.review_snapshots USING btree (property_id, created_at DESC);

CREATE POLICY "properties_add" ON "public"."properties"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((owner_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.discovery_runs d,
    LATERAL jsonb_array_elements(d.results) item(value)
  WHERE
    ((d.owner_id = ( SELECT auth.uid() AS uid)) AND (d.status = 'completed'::text) AND ((item.value ->> 'sourceId'::text) = properties.source_id) AND (item.value =
    properties.listing))))));

CREATE POLICY "properties_read" ON "public"."properties"
  FOR SELECT
  TO "authenticated"
  USING ((owner_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "property_runs_enqueue" ON "public"."review_collection_runs"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((owner_id = ( SELECT auth.uid() AS uid)) AND (analysis_id IS NULL) AND (EXISTS ( SELECT 1
   FROM public.properties p
  WHERE ((p.id = review_collection_runs.property_id) AND (p.owner_id = ( SELECT auth.uid() AS uid)))))));

REVOKE ALL ON FUNCTION "private"."freeze_analysis_reviews"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "private"."freeze_analysis_reviews"(uuid) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."list_property_metrics"() TO "authenticated";

REVOKE ALL ON FUNCTION "public"."list_property_metrics"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."list_property_metrics"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."list_property_metrics"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."queue_property_collection"(uuid, integer, date, date) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."queue_property_collection"(uuid, integer, date, date) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."queue_property_collection"(uuid, integer, date, date) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."queue_property_collection"(uuid, integer, date, date) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."queue_review_collection"(uuid, integer) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."queue_review_collection"(uuid, integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."queue_review_collection"(uuid, integer) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."queue_review_collection"(uuid, integer) TO "service_role";

GRANT USAGE ON SCHEMA "private" TO "authenticated";

REVOKE ALL ON TABLE "public"."properties" FROM "authenticated";

GRANT INSERT, SELECT ON TABLE "public"."properties" TO "authenticated";

REVOKE ALL ON TABLE "public"."properties" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."properties" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."properties" TO "service_role";


-- Preserve the source identities already selected in saved analyses.
insert into public.properties(owner_id,source_id,listing)
select distinct on(a.owner_id,item->>'sourceId') a.owner_id,item->>'sourceId',item-'role'-'label'
from public.analyses a join public.analysis_versions v on v.analysis_id=a.id,
lateral jsonb_array_elements(v.config->'listings') item
order by a.owner_id,item->>'sourceId',v.created_at desc
on conflict do nothing;

-- Seed an independent property snapshot from existing frozen review data.
do $$
declare p public.properties; old public.review_snapshots; src public.review_collection_sources; r uuid; s uuid;
begin
 for p in select * from public.properties loop
  select snap.* into old from public.review_snapshots snap join public.review_collection_sources c on c.run_id=snap.run_id
  where snap.owner_id=p.owner_id and c.listing_id=p.source_id order by snap.created_at desc limit 1;
  if old.id is null then continue; end if;
  select * into src from public.review_collection_sources where run_id=old.run_id and listing_id=p.source_id;
  insert into public.review_collection_runs(owner_id,property_id,analysis_version,config,requested_start,requested_end,max_reviews,status,finished_at,created_at)
  values(p.owner_id,p.id,1,jsonb_build_object('listings',jsonb_build_array(p.listing||jsonb_build_object('label',p.listing->>'name','role','primary'))),old.requested_start,old.requested_end,(select max_reviews from public.review_collection_runs where id=old.run_id),
  case when src.status='completed' then 'completed' else 'partial' end,old.created_at,old.created_at) returning id into r;
  insert into public.review_collection_sources(run_id,owner_id,listing_id,listing_url,label,role,ordinal,status,returned_count,accepted_count,skipped_count,missing_id_count,missing_reviewer_count,duplicate_count,earliest_at,latest_at,capped,error,provider_build_id)
  values(r,p.owner_id,p.source_id,p.listing->>'url',p.listing->>'name','primary',1,src.status,src.returned_count,src.accepted_count,src.skipped_count,src.missing_id_count,src.missing_reviewer_count,src.duplicate_count,src.earliest_at,src.latest_at,src.capped,src.error,src.provider_build_id);
  insert into public.review_snapshots(run_id,owner_id,property_id,analysis_version,requested_start,requested_end,created_at)
  values(r,p.owner_id,p.id,1,old.requested_start,old.requested_end,old.created_at) returning id into s;
  insert into public.review_snapshot_items select s,i.review_id,i.revision_id,i.owner_id from public.review_snapshot_items i join public.source_reviews rev on rev.id=i.review_id where i.snapshot_id=old.id and rev.listing_id=p.source_id;
 end loop;
end $$;
