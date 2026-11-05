create or replace function public.prepare_comparison_ai_snapshots(
  p_analysis uuid,
  p_snapshot_ids uuid[]
) returns table(import_id uuid, row_count integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  org uuid := private.current_organization_id();
  version_number integer;
  valid_snapshots integer;
  prepared_id uuid;
  prepared_count integer;
begin
  if coalesce(cardinality(p_snapshot_ids), 0) = 0 then
    raise exception 'SNAPSHOTS_REQUIRED';
  end if;
  if cardinality(p_snapshot_ids) > 20
    or cardinality(p_snapshot_ids) <> (
      select count(distinct snapshot_id)
      from unnest(p_snapshot_ids) as supplied(snapshot_id)
    ) then
    raise exception 'SNAPSHOTS_INVALID';
  end if;

  select current_version into version_number
  from public.analyses
  where id = p_analysis and organization_id = org;
  if version_number is null then raise exception 'SCOPE_NOT_FOUND'; end if;

  select count(*) into valid_snapshots
  from public.review_snapshots s
  where s.id = any(p_snapshot_ids)
    and s.analysis_id = p_analysis
    and s.organization_id = org;
  if valid_snapshots <> cardinality(p_snapshot_ids) then
    raise exception 'SNAPSHOT_NOT_FOUND';
  end if;

  select count(distinct i.review_id)::integer into prepared_count
  from public.review_snapshot_items i
  join public.review_snapshots s on s.id = i.snapshot_id
  join public.source_reviews r on r.id = i.review_id
  join public.review_revisions v on v.id = i.revision_id
  join public.review_collection_sources cs
    on cs.run_id = s.run_id and cs.listing_id = r.listing_id
  where i.snapshot_id = any(p_snapshot_ids)
    and s.analysis_id = p_analysis
    and s.organization_id = org
    and btrim(v.original_text) <> '';
  if prepared_count = 0 then raise exception 'NO_REVIEW_ROWS'; end if;

  insert into public.comparison_ai_imports(
    organization_id, analysis_id, analysis_version, file_name, import_kind,
    row_count, aggregate_content, source_snapshot_ids
  ) values (
    org, p_analysis, version_number,
    'Review snapshots · ' || cardinality(p_snapshot_ids)::text,
    'review_rows', prepared_count, null, p_snapshot_ids
  ) returning id into prepared_id;

  with selected as (
    select distinct on (i.review_id)
      i.review_id,
      r.listing_id,
      cs.label as listing_label,
      (v.published_at at time zone 'UTC')::date as published_at,
      v.rating,
      v.original_text as review_text,
      v.original_language as language,
      v.review_url as source_url
    from public.review_snapshot_items i
    join public.review_snapshots s on s.id = i.snapshot_id
    join public.source_reviews r on r.id = i.review_id
    join public.review_revisions v on v.id = i.revision_id
    join public.review_collection_sources cs
      on cs.run_id = s.run_id and cs.listing_id = r.listing_id
    where i.snapshot_id = any(p_snapshot_ids)
      and s.analysis_id = p_analysis
      and s.organization_id = org
      and btrim(v.original_text) <> ''
    order by i.review_id, s.created_at desc, s.id desc
  ), numbered as (
    select row_number() over (order by listing_label, published_at, review_id)::integer as row_number,
      listing_id, listing_label, published_at, rating, review_text, language, source_url
    from selected
  ), inserted as (
    insert into public.comparison_ai_reviews(
      organization_id, import_id, sheet_name, row_number, listing_id, listing_label,
      published_at, rating, review_text, language, source_url
    )
    select org, prepared_id, 'Review snapshot', row_number, listing_id, listing_label,
      published_at, rating, review_text, language, source_url
    from numbered
    returning 1
  )
  select count(*)::integer into prepared_count from inserted;

  if prepared_count = 0 then raise exception 'NO_REVIEW_ROWS'; end if;

  return query select prepared_id, prepared_count;
end;
$$;

revoke all on function public.prepare_comparison_ai_snapshots(uuid,uuid[]) from public, anon;
grant execute on function public.prepare_comparison_ai_snapshots(uuid,uuid[]) to authenticated;

-- Repair dataset counters created before the immutable insert stored the count.
update public.comparison_ai_imports dataset
set row_count = (
  select count(*)::integer from public.comparison_ai_reviews review
  where review.import_id = dataset.id
)
where dataset.import_kind = 'review_rows';
