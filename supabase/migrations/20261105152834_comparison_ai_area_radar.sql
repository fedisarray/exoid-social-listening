alter table public.comparison_ai_jobs
  drop constraint comparison_ai_jobs_visualization_type_check,
  add constraint comparison_ai_jobs_visualization_type_check
    check (visualization_type in (
      'sentiment', 'themes', 'sentiment_trend', 'listing_comparison',
      'word_cloud', 'area', 'radar'
    ));
