create or replace function private.review_metrics(p_revisions uuid[],p_sources jsonb,p_start date,p_end date,p_kind text,p_quarter integer,p_year integer)
returns jsonb language sql stable set search_path='' as $$
with src as(select * from jsonb_to_recordset(p_sources) as x(listing_id text,status text,role text,ordinal integer)),
base as(select r.id,r.listing_id,v.rating,v.published_at,v.original_text,v.original_language,v.reviewer_id,v.review_url
 from public.review_revisions v join public.source_reviews r on r.id=v.review_id
 where v.id=any(p_revisions) and v.owner_id=auth.uid()),
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
