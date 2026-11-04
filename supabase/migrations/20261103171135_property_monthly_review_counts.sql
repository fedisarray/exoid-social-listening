create or replace function public.list_property_metrics()
returns jsonb language sql stable set search_path='' as $$
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
where p.owner_id=auth.uid() and p.deleted_at is null;
$$;
