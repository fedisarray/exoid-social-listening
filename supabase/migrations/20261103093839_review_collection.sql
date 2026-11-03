SET local check_function_bodies = off;

CREATE TABLE "public"."review_collection_runs" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "owner_id"         uuid                     NOT NULL,
  "analysis_id"      uuid                     NOT NULL,
  "analysis_version" integer                  NOT NULL,
  "config"           jsonb                    NOT NULL,
  "requested_start"  date                     NOT NULL,
  "requested_end"    date                     NOT NULL,
  "max_reviews"      integer                  NOT NULL,
  "status"           text                     NOT NULL DEFAULT 'queued'::text,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "finished_at"      timestamp with time zone,
  "lease_token"      uuid,
  "lease_until"      timestamp with time zone,
  "next_attempt_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "review_collection_runs_max_reviews_check" CHECK (((max_reviews >= 100) AND (max_reviews <= 10000))),
  CONSTRAINT "review_collection_runs_pkey" PRIMARY KEY (id),
  CONSTRAINT "review_collection_runs_status_check" CHECK ((status = ANY (ARRAY['queued'::text, 'running'::text, 'completed'::text, 'partial'::text, 'failed'::text])))
);

ALTER TABLE "public"."review_collection_runs"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."review_collection_runs" FROM "anon";

CREATE TABLE "public"."review_collection_sources" (
  "id"                     uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "run_id"                 uuid                     NOT NULL,
  "owner_id"               uuid                     NOT NULL,
  "listing_id"             text                     NOT NULL,
  "listing_url"            text                     NOT NULL,
  "label"                  text                     NOT NULL,
  "role"                   text                     NOT NULL,
  "ordinal"                integer                  NOT NULL,
  "status"                 text                     NOT NULL DEFAULT 'queued'::text,
  "provider_run_id"        text,
  "provider_build_id"      text,
  "provider_status"        text,
  "dataset_id"             text,
  "provider_cost"          numeric,
  "dataset_total"          integer,
  "next_offset"            integer                  NOT NULL DEFAULT 0,
  "returned_count"         integer                  NOT NULL DEFAULT 0,
  "accepted_count"         integer                  NOT NULL DEFAULT 0,
  "skipped_count"          integer                  NOT NULL DEFAULT 0,
  "missing_id_count"       integer                  NOT NULL DEFAULT 0,
  "missing_reviewer_count" integer                  NOT NULL DEFAULT 0,
  "duplicate_count"        integer                  NOT NULL DEFAULT 0,
  "earliest_at"            timestamp with time zone,
  "latest_at"              timestamp with time zone,
  "capped"                 boolean                  NOT NULL DEFAULT false,
  "error"                  text,
  "attempts"               integer                  NOT NULL DEFAULT 0,
  CONSTRAINT "review_collection_sources_pkey" PRIMARY KEY (id),
  CONSTRAINT "review_collection_sources_run_id_listing_id_key" UNIQUE (run_id, listing_id),
  CONSTRAINT "review_collection_sources_status_check"
    CHECK ((status = ANY (ARRAY['queued'::text, 'starting'::text, 'running'::text, 'importing'::text, 'completed'::text, 'partial'::text, 'failed'::text])))
);

ALTER TABLE "public"."review_collection_sources"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."review_collection_sources" FROM "anon";

CREATE TABLE "public"."review_revisions" (
  "id"                   uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "review_id"            uuid                     NOT NULL,
  "owner_id"             uuid                     NOT NULL,
  "content_hash"         text                     NOT NULL,
  "rating"               smallint,
  "published_at"         timestamp with time zone NOT NULL,
  "original_text"        text                     NOT NULL DEFAULT ''::text,
  "original_language"    text,
  "reviewer_id"          text,
  "review_url"           text,
  "observed_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "collection_source_id" uuid                     NOT NULL,
  CONSTRAINT "review_revisions_pkey" PRIMARY KEY (id),
  CONSTRAINT "review_revisions_rating_check" CHECK (((rating >= 1) AND (rating <= 5))),
  CONSTRAINT "review_revisions_review_id_content_hash_key" UNIQUE (review_id, content_hash)
);

ALTER TABLE "public"."review_revisions"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."review_revisions" FROM "anon";

CREATE TABLE "public"."review_snapshot_items" (
  "snapshot_id" uuid NOT NULL,
  "review_id"   uuid NOT NULL,
  "revision_id" uuid NOT NULL,
  "owner_id"    uuid NOT NULL,
  CONSTRAINT "review_snapshot_items_pkey" PRIMARY KEY (snapshot_id, review_id)
);

ALTER TABLE "public"."review_snapshot_items"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."review_snapshot_items" FROM "anon";

CREATE TABLE "public"."review_snapshots" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "run_id"           uuid                     NOT NULL,
  "owner_id"         uuid                     NOT NULL,
  "analysis_id"      uuid                     NOT NULL,
  "analysis_version" integer                  NOT NULL,
  "requested_start"  date                     NOT NULL,
  "requested_end"    date                     NOT NULL,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "review_snapshots_pkey" PRIMARY KEY (id),
  CONSTRAINT "review_snapshots_run_id_key" UNIQUE (run_id)
);

ALTER TABLE "public"."review_snapshots"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."review_snapshots" FROM "anon";

CREATE TABLE "public"."source_reviews" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "owner_id"            uuid                     NOT NULL,
  "source"              text                     NOT NULL DEFAULT 'google'::text,
  "source_review_id"    text                     NOT NULL,
  "listing_id"          text                     NOT NULL,
  "current_revision_id" uuid,
  "first_collected_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "last_collected_at"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "source_reviews_owner_id_source_source_review_id_key" UNIQUE (owner_id, source, source_review_id),
  CONSTRAINT "source_reviews_pkey" PRIMARY KEY (id),
  CONSTRAINT "source_reviews_source_check" CHECK ((source = 'google'::text))
);

ALTER TABLE "public"."source_reviews"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."source_reviews" FROM "anon";

CREATE OR REPLACE FUNCTION public.claim_review_collection()
  RETURNS SETOF public.review_collection_runs
  LANGUAGE sql
  SET search_path TO ''
  AS $function$
 update public.review_collection_runs set status='running',lease_token=gen_random_uuid(),lease_until=now()+interval '120 seconds'
 where id=(select id from public.review_collection_runs where status in ('queued','running') and next_attempt_at<=now() and (lease_until is null or lease_until<now()) order by next_attempt_at,created_at for update skip locked limit 1)
 returning *;
$function$;

REVOKE ALL ON FUNCTION "public"."claim_review_collection"() FROM PUBLIC, "anon", "authenticated";

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
 insert into public.review_snapshots(run_id,owner_id,analysis_id,analysis_version,requested_start,requested_end)
 values(run.id,run.owner_id,run.analysis_id,run.analysis_version,run.requested_start,run.requested_end) returning id into snap;
 insert into public.review_snapshot_items(snapshot_id,review_id,revision_id,owner_id)
 select snap,r.id,r.current_revision_id,run.owner_id from public.source_reviews r join public.review_revisions v on v.id=r.current_revision_id
 where r.owner_id=run.owner_id and r.listing_id in(select listing_id from public.review_collection_sources where run_id=run.id)
 and v.published_at>=run.requested_start::timestamp at time zone 'UTC' and v.published_at<(run.requested_end+1)::timestamp at time zone 'UTC';
 end if;
 update public.review_collection_runs set status=final_status,finished_at=now(),lease_until=null,lease_token=null where id=run.id;
end; $function$;

REVOKE ALL ON FUNCTION "public"."finish_review_collection"(uuid, uuid) FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.get_review_dashboard_metrics (
  p_snapshot uuid,
  p_start    date,
  p_end      date,
  p_kind     text,
  p_quarter  integer,
  p_year     integer
)
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SET search_path TO ''
  AS $function$
with snapshot as(select * from public.review_snapshots where id=p_snapshot),
src as(select cs.* from public.review_collection_sources cs join snapshot s on cs.run_id=s.run_id),
base as(select r.id,r.listing_id,v.rating,v.published_at,v.original_text,v.original_language,v.reviewer_id,v.review_url from public.review_snapshot_items i join public.source_reviews r on r.id=i.review_id join public.review_revisions v on v.id=i.revision_id where i.snapshot_id=p_snapshot),
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
) where exists(select 1 from snapshot);
$function$;

REVOKE ALL ON FUNCTION "public"."get_review_dashboard_metrics"(uuid, date, date, text, integer, integer) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.ingest_review_page (
  p_source_id   uuid,
  p_lease       uuid,
  p_offset      integer,
  p_consumed    integer,
  p_reviews     jsonb,
  p_skipped     integer,
  p_missing_ids integer
)
  RETURNS void
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare src public.review_collection_sources; run public.review_collection_runs; item jsonb; rec public.source_reviews; rev uuid; duplicates integer:=0; accepted integer:=0; skipped integer:=p_skipped; missing_reviewers integer:=0; earliest timestamptz; latest timestamptz;
begin
 select * into src from public.review_collection_sources where id=p_source_id for update;
 select * into run from public.review_collection_runs where id=src.run_id and lease_token=p_lease and lease_until>now();
 if run.id is null then raise exception 'LEASE_LOST'; end if;
 if src.next_offset<>p_offset then return; end if;
 for item in select value from jsonb_array_elements(p_reviews) loop
  select * into rec from public.source_reviews where owner_id=run.owner_id and source='google' and source_review_id=item->>'sourceReviewId';
  if rec.id is null then
   insert into public.source_reviews(owner_id,source_review_id,listing_id) values(run.owner_id,item->>'sourceReviewId',src.listing_id) returning * into rec;
  elsif rec.listing_id<>src.listing_id then skipped:=skipped+1;continue;
  else duplicates:=duplicates+1;
  end if;
  insert into public.review_revisions(review_id,owner_id,content_hash,rating,published_at,original_text,original_language,reviewer_id,review_url,collection_source_id)
  values(rec.id,run.owner_id,item->>'contentHash',(item->>'rating')::smallint,(item->>'publishedAt')::timestamptz,item->>'text',item->>'language',item->>'reviewerId',item->>'url',src.id)
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
end; $function$;

REVOKE ALL ON FUNCTION "public"."ingest_review_page"(uuid, uuid, integer, integer, jsonb, integer, integer) FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.queue_review_collection (
  p_analysis_id uuid,
  p_max_reviews integer
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare a public.analyses; cfg jsonb; target uuid;
begin
 select * into a from public.analyses where id=p_analysis_id and owner_id=auth.uid();
 if a.id is null then raise exception 'ANALYSIS_NOT_FOUND'; end if;
 select id into target from public.review_collection_runs where analysis_id=a.id and status in ('queued','running');
 if target is not null then return target; end if;
 select config into cfg from public.analysis_versions where analysis_id=a.id and version=a.current_version;
 begin
 insert into public.review_collection_runs(owner_id,analysis_id,analysis_version,config,requested_start,requested_end,max_reviews)
 values(auth.uid(),a.id,a.current_version,cfg,least(date '2022-01-01',(cfg->'period'->>'start')::date),greatest((cfg->'period'->>'end')::date,(cfg->'period'->>'cutoff')::date),p_max_reviews) returning id into target;
 exception when unique_violation then
 select id into target from public.review_collection_runs where analysis_id=a.id and status in ('queued','running'); return target;
 end;
 insert into public.review_collection_sources(run_id,owner_id,listing_id,listing_url,label,role,ordinal)
 select target,auth.uid(),item->>'sourceId',item->>'url',item->>'label',item->>'role',ord::integer from jsonb_array_elements(cfg->'listings') with ordinality items(item,ord);
 return target;
end; $function$;

REVOKE ALL ON FUNCTION "public"."queue_review_collection"(uuid, integer) FROM PUBLIC, "anon";

ALTER TABLE "public"."review_collection_runs"
  ADD CONSTRAINT "review_collection_runs_analysis_id_analysis_version_fkey" FOREIGN KEY (analysis_id, analysis_version) REFERENCES public.analysis_versions(analysis_id, VERSION)
    ON DELETE CASCADE;

ALTER TABLE "public"."review_collection_runs"
  ADD CONSTRAINT "review_collection_runs_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."review_collection_sources"
  ADD CONSTRAINT "review_collection_sources_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."review_collection_sources"
  ADD CONSTRAINT "review_collection_sources_run_id_fkey" FOREIGN KEY (run_id) REFERENCES public.review_collection_runs(id) ON DELETE CASCADE;

ALTER TABLE "public"."review_revisions"
  ADD CONSTRAINT "review_revisions_collection_source_id_fkey" FOREIGN KEY (collection_source_id) REFERENCES public.review_collection_sources(id);

ALTER TABLE "public"."review_revisions"
  ADD CONSTRAINT "review_revisions_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."review_snapshot_items"
  ADD CONSTRAINT "review_snapshot_items_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."review_snapshot_items"
  ADD CONSTRAINT "review_snapshot_items_revision_id_fkey" FOREIGN KEY (revision_id) REFERENCES public.review_revisions(id);

ALTER TABLE "public"."review_snapshots"
  ADD CONSTRAINT "review_snapshots_analysis_id_fkey" FOREIGN KEY (analysis_id) REFERENCES public.analyses(id) ON DELETE CASCADE;

ALTER TABLE "public"."review_snapshots"
  ADD CONSTRAINT "review_snapshots_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."review_snapshot_items"
  ADD CONSTRAINT "review_snapshot_items_snapshot_id_fkey" FOREIGN KEY (snapshot_id) REFERENCES public.review_snapshots(id) ON DELETE CASCADE;

ALTER TABLE "public"."review_snapshots"
  ADD CONSTRAINT "review_snapshots_run_id_fkey" FOREIGN KEY (run_id) REFERENCES public.review_collection_runs(id) ON DELETE CASCADE;

ALTER TABLE "public"."source_reviews"
  ADD CONSTRAINT "source_reviews_current_revision_id_fkey" FOREIGN KEY (current_revision_id) REFERENCES public.review_revisions(id);

ALTER TABLE "public"."source_reviews"
  ADD CONSTRAINT "source_reviews_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."review_revisions"
  ADD CONSTRAINT "review_revisions_review_id_fkey" FOREIGN KEY (review_id) REFERENCES public.source_reviews(id) ON DELETE CASCADE;

ALTER TABLE "public"."review_snapshot_items"
  ADD CONSTRAINT "review_snapshot_items_review_id_fkey" FOREIGN KEY (review_id) REFERENCES public.source_reviews(id);

CREATE UNIQUE INDEX review_collection_one_active ON public.review_collection_runs USING btree (analysis_id)
  WHERE (status = ANY (ARRAY['queued'::text, 'running'::text]));

CREATE INDEX review_collection_owner_analysis ON public.review_collection_runs USING btree (owner_id, analysis_id, created_at DESC);

CREATE INDEX review_collection_pending ON public.review_collection_runs USING btree (next_attempt_at, created_at)
  WHERE (status = ANY (ARRAY['queued'::text, 'running'::text]));

CREATE INDEX review_collection_sources_owner ON public.review_collection_sources USING btree (owner_id);

CREATE INDEX review_collection_sources_run ON public.review_collection_sources USING btree (run_id, ordinal);

CREATE INDEX review_revisions_collection ON public.review_revisions USING btree (collection_source_id);

CREATE INDEX review_revisions_owner ON public.review_revisions USING btree (owner_id);

CREATE INDEX review_snapshot_items_owner ON public.review_snapshot_items USING btree (owner_id);

CREATE INDEX review_snapshot_items_revision ON public.review_snapshot_items USING btree (revision_id);

CREATE INDEX review_snapshots_owner_analysis ON public.review_snapshots USING btree (owner_id, analysis_id, analysis_version, created_at DESC);

CREATE INDEX source_reviews_owner_listing ON public.source_reviews USING btree (owner_id, listing_id);

CREATE POLICY "collection_runs_enqueue" ON "public"."review_collection_runs"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((owner_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.analyses a
  WHERE ((a.id = review_collection_runs.analysis_id) AND (a.owner_id = ( SELECT auth.uid() AS uid)))))));

CREATE POLICY "collection_runs_read" ON "public"."review_collection_runs"
  FOR SELECT
  TO "authenticated"
  USING ((owner_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "collection_sources_enqueue" ON "public"."review_collection_sources"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((owner_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.review_collection_runs r
  WHERE ((r.id = review_collection_sources.run_id) AND (r.owner_id = ( SELECT auth.uid() AS uid)))))));

CREATE POLICY "collection_sources_read" ON "public"."review_collection_sources"
  FOR SELECT
  TO "authenticated"
  USING ((owner_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "review_revisions_read" ON "public"."review_revisions"
  FOR SELECT
  TO "authenticated"
  USING ((owner_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "review_snapshot_items_read" ON "public"."review_snapshot_items"
  FOR SELECT
  TO "authenticated"
  USING ((owner_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "review_snapshots_read" ON "public"."review_snapshots"
  FOR SELECT
  TO "authenticated"
  USING ((owner_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "source_reviews_read" ON "public"."source_reviews"
  FOR SELECT
  TO "authenticated"
  USING ((owner_id = ( SELECT auth.uid() AS uid)));

REVOKE ALL ON FUNCTION "public"."claim_review_collection"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."claim_review_collection"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."claim_review_collection"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."finish_review_collection"(uuid, uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."finish_review_collection"(uuid, uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."finish_review_collection"(uuid, uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."get_review_dashboard_metrics"(uuid, date, date, text, integer, integer) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."get_review_dashboard_metrics"(uuid, date, date, text, integer, integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_review_dashboard_metrics"(uuid, date, date, text, integer, integer) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_review_dashboard_metrics"(uuid, date, date, text, integer, integer) TO "service_role";

REVOKE ALL ON FUNCTION "public"."ingest_review_page"(uuid, uuid, integer, integer, jsonb, integer, integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."ingest_review_page"(uuid, uuid, integer, integer, jsonb, integer, integer) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."ingest_review_page"(uuid, uuid, integer, integer, jsonb, integer, integer) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."queue_review_collection"(uuid, integer) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."queue_review_collection"(uuid, integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."queue_review_collection"(uuid, integer) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."queue_review_collection"(uuid, integer) TO "service_role";

REVOKE ALL ON TABLE "public"."review_collection_runs" FROM "authenticated";

GRANT INSERT, SELECT ON TABLE "public"."review_collection_runs" TO "authenticated";

REVOKE ALL ON TABLE "public"."review_collection_runs" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."review_collection_runs" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."review_collection_runs" TO "service_role";

REVOKE ALL ON TABLE "public"."review_collection_sources" FROM "authenticated";

GRANT INSERT, SELECT ON TABLE "public"."review_collection_sources" TO "authenticated";

REVOKE ALL ON TABLE "public"."review_collection_sources" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."review_collection_sources" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."review_collection_sources" TO "service_role";

REVOKE ALL ON TABLE "public"."review_revisions" FROM "authenticated";

GRANT SELECT ON TABLE "public"."review_revisions" TO "authenticated";

REVOKE ALL ON TABLE "public"."review_revisions" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."review_revisions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."review_revisions" TO "service_role";

REVOKE ALL ON TABLE "public"."review_snapshot_items" FROM "authenticated";

GRANT SELECT ON TABLE "public"."review_snapshot_items" TO "authenticated";

REVOKE ALL ON TABLE "public"."review_snapshot_items" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."review_snapshot_items" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."review_snapshot_items" TO "service_role";

REVOKE ALL ON TABLE "public"."review_snapshots" FROM "authenticated";

GRANT SELECT ON TABLE "public"."review_snapshots" TO "authenticated";

REVOKE ALL ON TABLE "public"."review_snapshots" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."review_snapshots" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."review_snapshots" TO "service_role";

REVOKE ALL ON TABLE "public"."source_reviews" FROM "authenticated";

GRANT SELECT ON TABLE "public"."source_reviews" TO "authenticated";

REVOKE ALL ON TABLE "public"."source_reviews" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."source_reviews" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."source_reviews" TO "service_role";
