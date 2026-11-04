export const reportsEN = {
  keyLearnings: "Key Learnings",
  actions: "ACTIONS",
  contents: "Index",
  sources: "Sources and methodology",
  unavailable:
    "Data unavailable for this selection or period. Complete coverage before interpreting this chart.",
  embeddedData:
    "Exact chart values and sample sizes: right-click the chart → Edit Data",
  sharedDirection: "Share direction",
  primaryShare: "Share of primary reviewers",
  competitorShare: "Share of competitor reviewers",
  primaryReviewers: "Primary reviewers",
  competitorReviewers: "Competitor reviewers",
  editableCharts: "Editable charts",

  sharedVisitorsTitle: "Shared Visitors",
  sharedVisitorsSubtitle: "% OF SHARED VISITORS DURING THE L12M",
  sharedVisitorsMethod:
    "Visitors here means unique identifiable Google reviewers, not measured physical visits. Primary share = shared reviewers / primary reviewers; competitor share = shared reviewers / competitor reviewers, within the stated L12M window. Unavailable coverage or reviewer identities must be labelled explicitly.",

  cancelled: "Cancelled",
  cancel: "Cancel report",
  cancelHint:
    "Stops processing in the app. Remote generation and any charges may continue.",

  configure: "Configure PowerPoint",
  title: "PowerPoint report",
  description:
    "Uses the current export selection: places, chart sheets, dates, history and language. Each report saves its own configuration.",
  generate: "Generate PowerPoint",
  regenerate: "Generate new version",
  draft: "Draft",
  draftHint: "Review figures and layout before sharing.",
  history: "Previous reports ({count})",
  download: "Download PowerPoint",
  resume: "Resume generation",
  coverageHint:
    "Collect the missing reviews for these dates before generating a report.",
  loadError: "Reports could not be loaded. Try again.",
  retry: "Try again",
  version: "Configuration v{version}",
  historyScope: "Report dates: {start} – {end}",
  queued: "Queued",
  starting: "Starting report",
  generating: "Creating presentation",
  downloading: "Saving PowerPoint",
  completed: "Ready to download",
  failed: "Generation failed",
  stalled: "Processing has stopped. Resume to continue the saved job.",
  scopeChanged: "This report uses a previous configuration or different dates.",
  language: "Language",
  selected: "Selected period",
  reviewVolume: "Review volume",
  averageRating: "Average rating",
  satisfaction: "4–5-star share",
  sharedReviewers: "Shared reviewers",
  methodology:
    "Figures describe collected Google reviews, not all reviews ever published. Dates use UTC. Missing values mean unavailable data, never zero. Satisfaction is the number of 4–5-star reviews divided by all rated reviews, expressed as a percentage. Average rating uses rated reviews only.",
  noFindings:
    "Reviewed findings are not included. Do not generate strengths, weaknesses, recommendations, quotations or unsupported claims.",
  historyNotice:
    "Historical periods without complete coverage are unavailable. Keep trailing twelve months, calendar years and the selected period distinct.",
  errors: {
    INVALID_SELECTION:
      "Choose at least one place and chart sheet, and a valid history length.",
    REPORTING_NOT_CONFIGURED:
      "PowerPoint generation needs configuration. Contact your administrator.",
    WORKER_NOT_CONFIGURED:
      "Report processing needs configuration. Contact your administrator.",
    WORKER_UNAVAILABLE:
      "Report processing could not start. Resume the saved job.",
    TEMPLATE_NOT_CONFIGURED:
      "Your organization needs a report template. Contact your administrator.",
    TEMPLATE_INVALID:
      "The organization’s template is unavailable. Ask an administrator to check it.",
    ANALYSIS_NOT_FOUND:
      "This comparison is unavailable. Return to comparisons.",
    SNAPSHOT_NOT_FOUND:
      "The saved dataset is unavailable. Reload and choose another dataset.",
    CONFIGURATION_CHANGED: "The comparison changed. Reload before generating.",
    COVERAGE_INCOMPLETE:
      "Some dates lack review coverage. Collect the missing reviews and retry.",
    INVALID_PERIOD: "Choose a valid period ending before today.",
    ACCESS_DENIED:
      "The reporting service could not be accessed. Ask an administrator to check configuration.",
    USAGE_LIMIT:
      "The reporting service’s usage limit was reached. Contact your administrator.",
    RATE_LIMITED:
      "The reporting service is busy. Try generating again shortly.",
    START_UNCERTAIN:
      "The generation request could not be confirmed. Ask an administrator to check it before generating again to avoid a duplicate charge.",
    GENERATION_FAILED:
      "The presentation could not be generated. Try creating a new version.",
    GENERATION_TIMED_OUT:
      "Report generation timed out. Contact your administrator before retrying.",
    EXPORT_FAILED:
      "The presentation was created, but PowerPoint export failed. Contact your administrator.",
    DOWNLOAD_FAILED:
      "The PowerPoint file could not be saved. Contact your administrator.",
    INVALID_POWERPOINT:
      "The reporting service returned an invalid PowerPoint file. Contact your administrator.",
    PROCESSING_FAILED:
      "The report could not be processed. Contact your administrator.",
  },
};
