CREATE OR REPLACE FUNCTION private.enqueue_comparison_report(p_analysis uuid, p_expected integer, p_period jsonb, p_locale text, p_options jsonb, p_snapshot uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare a public.analyses; snap public.review_snapshots; org uuid:=private.current_organization_id();
 template text; active uuid; frozen_run uuid; coverage jsonb; metrics jsonb; shared_l12m jsonb; target uuid;
 quarter_metrics jsonb:='{}'::jsonb; quarter_config record;
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
 -- Each worksheet quarter is aggregated from this immutable snapshot before generation.
 for quarter_config in
  select coalesce((settings->>'quarter')::integer,(p_period->>'quarter')::integer) as quarter,
   max(coalesce((settings->>'year')::integer,(p_period->>'year')::integer)) as year
  from jsonb_array_elements_text(p_options->'sheets') selected(id)
  cross join lateral (select p_options->'sheetSettings'->selected.id as settings) configured
  where settings->>'window'='quarterly'
  group by coalesce((settings->>'quarter')::integer,(p_period->>'quarter')::integer)
 loop
  if quarter_config.quarter is null or quarter_config.quarter not between 1 and 4
   or quarter_config.year is null or quarter_config.year not between 2000 and 2100 then
   raise exception 'INVALID_SELECTION';
  end if;
  quarter_metrics:=jsonb_set(quarter_metrics,array[quarter_config.quarter::text],
   public.get_review_dashboard_metrics(snap.id,
    make_date(quarter_config.year,(quarter_config.quarter-1)*3+1,1),
    (make_date(quarter_config.year,(quarter_config.quarter-1)*3+1,1)+interval '3 months - 1 day')::date,
    'quarter',quarter_config.quarter,quarter_config.year)->'quarters');
 end loop;
 insert into public.comparison_reports(organization_id,analysis_id,analysis_version,snapshot_id,period,locale,template_id,frozen_data)
 values(org,a.id,snap.analysis_version,snap.id,p_period,p_locale,template,jsonb_build_object(
 'name',a.name,'snapshot',jsonb_build_object('id',snap.id,'version',snap.analysis_version,'createdAt',snap.created_at,'start',snap.requested_start,'end',snap.requested_end),
 'coverage',coverage,'metrics',metrics,'sharedL12M',shared_l12m,'exportOptions',p_options,'quarterMetrics',quarter_metrics)) returning id into target;
 return target;
end;
$function$
