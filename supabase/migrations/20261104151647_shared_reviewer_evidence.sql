-- Evidence uses the same revisions and latest-per-reviewer rule as comparison metrics.
create function public.get_shared_reviewer_evidence(
 p_analysis uuid, p_competitor text, p_start date, p_end date, p_offset integer, p_snapshot uuid default null
) returns jsonb language sql stable security invoker set search_path='' as $$
with scope as (
 select a.id from public.analyses a where a.id=p_analysis and a.owner_id=auth.uid()
), snapshot as (
 select s.* from public.review_snapshots s join scope a on a.id=s.analysis_id
 where s.id=p_snapshot and s.owner_id=auth.uid()
), listings as (
 select item->>'sourceId' as listing_id,item->>'role' as role,p.id as property_id
 from scope a join public.analyses current_analysis on current_analysis.id=a.id
 join public.analysis_versions v on v.analysis_id=a.id and v.version=current_analysis.current_version
 cross join lateral jsonb_array_elements(v.config->'listings') item
 left join public.properties p on p.source_id=item->>'sourceId' and p.owner_id=auth.uid() and p.deleted_at is null
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
 where v.owner_id=auth.uid() and v.reviewer_id is not null
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
revoke all on function public.get_shared_reviewer_evidence(uuid,text,date,date,integer,uuid) from public,anon;
grant execute on function public.get_shared_reviewer_evidence(uuid,text,date,date,integer,uuid) to authenticated;
