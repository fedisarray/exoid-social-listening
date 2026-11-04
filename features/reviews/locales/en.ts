export const reviewsEN = {
  exportWorkspaceDescription:
    "Choose a comparison, dates and places, then configure the Excel sheets to download. Charts remain editable. Sentiment will be added later.",
  exportEmpty:
    "Save a comparison and collect its reviews to configure an export.",
  exportComparison: "Comparison",
  exportScope: "Dates and dataset",
  exportProperties: "Included places",
  exportSelectAll: "Select all places",
  exportContent: "Workbook sheets",
  exportContentHint:
    "The original seven sheets are selected by default. For custom dates or trailing twelve months, the period sheets show the selected range instead of quarterly history.",
  exportPeriodRating: "Selected-period average rating",
  exportPeriodSatisfaction: "Selected-period satisfaction",
  exportEmptyGroup:
    "No places in this group were selected. This sheet has no data.",
  exportHistory: "Previous years to include",
  exportHistoryHint:
    "0–20 years. Zero keeps the last-12-month and selected-period rows only.",
  exportCharts: "Include editable Excel charts",
  exportSummary: "Download summary",
  exportReset: "Reset configuration",
  exportNewDataset: "Create a frozen copy from collected reviews",
  exportFrozenHint:
    "Uses this dataset's frozen review revisions, property names, roles and coverage. Choose places again when changing datasets.",
  exportChecking: "Checking dataset and date coverage…",
  exportCoverageHint:
    "Choose at least one place with complete coverage for the selected dates. Collect missing dates from the comparison dashboard.",
  exportInvalidSelection:
    "Check the dates and years, and choose at least one valid place and sheet.",
  exportDownloadStarted:
    "Your download has started. The saved dataset is selected for the next export; your configuration is retained.",
  exportExcel: "Export Excel",
  excelNewDataset:
    "Creates a frozen copy of collected reviews. This requires coverage of the saved comparison dates for every place. The download includes only the places you select here.",
  excelDownload: "Download Excel (.xlsx)",
  excelGenerating: "Preparing Excel…",
  excelError:
    "Excel could not be generated. Retry; your saved data is unchanged.",
  excelCoverageError:
    "The export dates or saved comparison dates are not fully covered. Sync the missing dates, or choose an existing saved dataset, then retry.",
  excelVersionError:
    "The comparison setup changed. Reload the page before exporting.",
  excelNotFound:
    "This comparison is no longer available. Return to comparisons.",
  excelDataset: "Saved dataset",
  excelSource:
    "Figures describe collected Google reviews, not all reviews ever published. Source completeness cannot be guaranteed. Dates use UTC.",
  excelDates: "Dates (UTC)",
  excelMissing:
    "Blank cells and chart gaps mean unavailable data. A verified empty period has zero reviews and no rating or satisfaction score.",
  excelPartialHistory:
    "Some historical windows lack complete coverage across all places. Those figures are omitted; this is a partial historical report.",
  excelSatisfactionMethod:
    "Satisfaction = reviews with 4–5 stars / all rated reviews. The table below gives the rated-review sample size for each window.",
  excelSamples: "Rated-review sample sizes by period and place",
  indicators: "Review indicators",
  ratingChange: "Rating change",
  lowRatingShare: "1–2-star share",
  volumeChange: "Review-volume change",
  competitorGap: "Competitor rating gap",
  sharedReviewerGap: "Shared-reviewer rating gap",
  gapDirection: "Primary rating − competitor rating (points).",
  indicatorsHint:
    "Selected-period indicators. Changes compare with {start} – {end} (UTC). Rating gaps use {primary} as the primary place.",
  indicatorsMethod:
    "Rating changes and gaps are points; low-rating share uses rated reviews. Changes require complete coverage of both periods. Volume growth is unavailable when the previous count is zero. Gaps are shown for competitors only; shared-reviewer gaps use the same identified people. Missing coverage or ratings are unavailable.",

  trendRollingLabel: "Last 12 months",
  trendProperties: "Properties & competitors",
  trendQuarterly: "Quarterly comparison",
  trendAnchors: "Anchors",
  trendVolume: "Review volume",
  trendQuarterRating: "Quarter average rating",
  trendQuarterSatisfaction: "Quarter satisfaction",
  trendAnchorRating: "Anchor average rating",
  trendAnchorSatisfaction: "Anchor satisfaction",
  trendCountUnit: "Collected reviews · Google",
  trendRatingUnit: "Average rating · 0–5 bar scale · Google",
  trendSatisfactionUnit: "Share of rated reviews with 4–5 stars · Google",
  trendPeriod: "Period: {title}",
  trendHistory: "Full table · history",
  trendHistoryHint:
    "Only fully covered historical windows are available. Missing data is shown as —. Use Sync data to collect missing dates for every place.",
  trendSelectQuarter:
    "Select a quarter in the date filters to compare the same quarter across years.",
  syncData: "Sync data",
  syncing: "Syncing…",
  syncTooltip:
    "Collect missing reviews for all places in this comparison. Choose the dates before starting.",
  syncHelp: "About data sync",
  syncHistoryHint:
    "Historical charts need full date coverage: whole calendar years, the complete quarter, or the last 12 complete months. Completed coverage is reused. Today and future dates remain incomplete.",
  syncAllPlaces:
    "All {count} comparison places are included, regardless of the displayed group.",
  syncInvalidDates: "Enter valid dates with the start on or before the end.",
  syncStart: "Collect missing reviews",
  syncCovered: "Dates already covered",
  syncFrozen:
    "This saved dataset is frozen. Return to live data to collect missing reviews.",
  syncReturnLive: "Return to live data",

  close: "Close",
  coverageCheck: "Check dates",
  dataNotes: "About this data",
  evidence: "Latest reviews · up to 20",

  reviewsRatingTrend: "Monthly reviews and average rating",
  reviewCountAxis: "Saved reviews (left scale)",
  ratingAxis: "Average rating (right scale, 1–5)",
  noReviewTrend: "No saved reviews in this period.",
  ratingDistribution: "Rating breakdown",
  starCount: "{count, plural, one {# star} other {# stars}}",
  noRatedReviews: "No reviews with a rating in the selected period.",
  withText: "Reviews with comments",
  withoutText: "Reviews without comments",
  historicalSnapshotNotice:
    "You are viewing a saved dataset from configuration v{snapshotVersion}. The current setup is v{currentVersion}; properties and roles in this dataset reflect the earlier configuration.",
  mapsTotal: "Google Maps total",
  mapsChecked: "Checked {date}",
  mapsUnavailable: "Total not yet recorded",
  scopedReviews: "Saved reviews",
  partialPropertyMetrics:
    "Showing saved reviews in the selected period. Date coverage is incomplete, so counts and ratings may change as more reviews are collected.",
  countScopeHint:
    "Based on saved review observations. Verified date coverage is shown separately.",
  scopeTitle: "Why this count differs from Google Maps",
  scopeExplanation:
    "Google Maps counts all reviews. Here, ratings and counts use only the reviews we collected within the saved dates and selected period.",
  savedCoverage: "Saved review dates",
  ratingTrend: "Monthly average rating",
  noRatingTrend: "No dated ratings in this period.",
  noProperties: "No properties in this group.",
  notCollected: "Reviews not collected yet",
  noThumbnail: "No property photo",
  ratingBasis: "Based on {count} rated reviews",
  outOfFive: "out of 5",
  prepareSnapshot: "Save report dataset",
  preparingSnapshot: "Saving report dataset…",
  reuseHint:
    "All previously collected reviews are reused. To collect missing selected dates, choose “Retry missing dates” or collect reviews from My Places.",
  propertiesNotCollected:
    "Selected dates are not fully covered for every place. Wait for collection or retry missing dates.",
  manageProperties: "Go to my places",
  noAnalysisData: "Reviews are not ready for comparison",
  collect: "Collect reviews",
  refresh: "Refresh reviews",
  limit: "Maximum reviews to collect",
  collectHint:
    "Collects from the selected start date, newest first. The provider may also scan newer reviews; the review limit can leave older history incomplete.",
  startingCollection: "Queuing collection…",
  collectionError:
    "We could not start collecting reviews. Try again. If this continues, contact your workspace administrator.",
  apifyMissing:
    "Review collection is unavailable. Contact your workspace administrator and try again later.",
  workerMissing:
    "Review collection is unavailable. Contact your workspace administrator and try again later.",
  stalled:
    "Collection has paused. Contact your workspace administrator to resume it. Your saved reviews are safe.",
  loadError:
    "Unable to load collected data. Retry without starting another collection.",
  retry: "Retry",
  collection: "Collection",
  version: "Configuration version",
  queued: "Queued",
  starting: "Starting provider",
  running: "Collecting",
  importing: "Importing reviews",
  completed: "Processing finished",
  partial: "Partial",
  failed: "Failed",
  noData: "Collect reviews to see real comparisons",
  noDataHint:
    "Open “Collect reviews” to get started. You can leave the page while collection runs.",
  coverage:
    "Figures describe collected Google reviews, not all reviews ever published. Source completeness cannot be guaranteed. Missing IDs and skipped rows are disclosed below. Dates use UTC.",
  cap: "Review limit reached; history may be incomplete.",
  diagnostics: "Collection details",
  returned: "Returned",
  accepted: "Accepted observations",
  skipped: "Skipped records",
  duplicates: "Previously seen IDs",
  missingIds: "Missing review IDs",
  missingReviewers: "Missing reviewer IDs",
  observedRange: "Observed publication dates",
  error: "Error",
  providerErrors: {
    APIFY_USAGE_LIMIT_EXCEEDED:
      "The review provider’s monthly usage limit has been reached. Contact your workspace administrator to resolve the limit, then retry collection.",
    APIFY_ACCESS_DENIED:
      "The review provider denied access. Contact your workspace administrator to check the provider credentials and permissions, then retry collection.",
  },
  providerVersion: "Provider build",
  collectionPeriod: "Collection period (UTC)",
  lastCollected: "Last collected",
  collected: "Reviews saved on",
  history: "Previously saved reviews",
  latest: "Live collected reviews",
  reviews: "Collected reviews",
  rated: "Rated reviews",
  rating: "Average rating",
  satisfied: "4–5-star share",
  text: "Reviews with text",
  property: "Place",
  unavailable: "Unavailable",
  selected: "Selected period",
  propertyTrendsTitle: "Review trends",
  propertyTrendsHint:
    "Follow review activity and ratings over time, then compare complete reporting periods.",
  propertyMonthlyDetails: "Explore monthly figures",
  propertyQuarterHint:
    "The same quarter across years · Google reviews · missing coverage is shown as a dash.",
  propertyHistoryHint:
    "Complete calendar years · Google reviews · missing coverage is shown as a dash.",
  propertyPeriodChanges: "Changes in the selected period",
  propertyPreviousPeriod:
    "Changes compared with {range} (UTC). The 1–2-star share describes the selected period.",
  propertyChangesMethod:
    "Rating change is measured in points; volume change is a percentage. Both periods need complete coverage, and volume growth needs a nonzero previous count. Low-rating share uses rated reviews and requires complete selected-period coverage.",
  monthly: "Monthly trend",
  annual: "Full calendar-year history",
  quarters: "Same quarter by year",
  rolling: "Last 12 complete months",
  bucket: "Period",
  noWindowData:
    "No results in this window, or coverage is incomplete. Historical windows require coverage for every included place.",
  outOfRange: "These dates are not fully covered by this saved dataset.",
  changedConfig:
    "This snapshot belongs to a different configuration version. A new collection uses your current saved setup.",
  shared: "Shared reviewers in selected period",
  primaryShare: "Share of primary IDs",
  competitorShare: "Share of competitor IDs",
  primaryRating: "Primary subgroup rating",
  competitorRating: "Competitor subgroup rating",
  identities: "Identified reviewers (primary / competitor)",
  identityCoverage: "Reviews with reviewer IDs",
  sharedComparisonHint:
    "Reviewers who also reviewed {primary}, using Google reviews from the selected dates.",
  sharedCount: "Shared reviewers",
  sharedDirection: "Share of each place’s identified reviewers",
  sharedRatings: "Ratings by shared reviewers",
  sharedFraction: "{shared} of {total} identified reviewers",
  sharedRatingFor: "Shared reviewers’ rating · {property}",
  sharedMethod: "Identity coverage & calculation notes",
  sharedNoMatches:
    "No reviewer comparisons for this role. Choose another role to compare places.",
  sharedNote:
    "Same-source identities only; missing IDs are excluded. Subgroup scores use each reviewer’s latest eligible review per property. Overlap does not establish visits or market share.",
  ratingOnly: "Rating-only review",
  source: "Open source review",
  refreshNote:
    "Refreshing saves a new copy of the reviews. Earlier saved copies stay available.",
  workerActive: "Background collection continues when you leave this page.",
  snapshotDates: "Requested coverage",
  propertyCount: "Saved properties",
  group: "Group",
  allGroups: "All groups",
  coverageTitle: "Review date coverage",
  coverageReady: "Selected dates covered",
  coveredDates: "Collected without known gaps",
  missingDates: "Missing or unverified dates",
  requestedDates: "Requested collection dates",
  providerScope:
    "Provider scans from {start}, newest first; newer reviews may be collected again.",
  manualCoverageHint:
    "Saved reviews are reused. Collect manually to update them. Today and future dates are incomplete.",
  frozenCoverageHint:
    "This saved dataset uses frozen reviews and coverage. Viewing it never starts collection.",
  comparisonBlocked:
    "Some selected dates are missing. Full coverage is needed to show metrics.",
  futureCoverage: "Today or future dates are not fully available yet",
  placeRemoved: "Place is no longer saved",
  openPlace: "Open place",
  retryMissing: "Retry missing dates",
  freezeIncomplete:
    "The saved report period is not fully covered. Update the report dates or collect missing reviews first.",
  providerThrough: "Complete UTC days scanned through {end}.",
} as const;
