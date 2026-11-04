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
where p.owner_id=auth.uid();
$function$;
