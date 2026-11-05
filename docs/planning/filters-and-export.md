# Filters and export experience

Status: proposed interaction design, 2 November 2026, with the Excel addition below implemented on 4 November 2026. Builds on the analysis setup, analytics workspace, and reporting PRDs. PowerPoint remains the required presentation export.

## Dashboard filter bar

| Control | Behavior |
|---|---|
| Saved analysis | Open a saved set of own properties, competitors, and anchors. |
| Period | Choose quarter, last 12 complete months, or custom dates. A full-year preset is proposed. |
| Year and quarter | When quarter is selected, choose year and Q1/Q2/Q3/Q4. Show resolved start/end dates. |
| Comparison | Compare the selected quarter with the same quarter in available prior years. Label annual and trailing windows separately. |
| Properties | Show selected own properties, competitors, or anchors; keep primary and additional own series distinct. |
| Dataset version | Show the frozen dataset and last collection time; disclose partial coverage. Refresh creates a new candidate version. |

The visible summary might read `Fiumara · Q1 2026 · 1 Jan–31 Mar 2026 · 5 properties`. The report cutoff is visible alongside separate L12M and annual sections.

Changing filters updates exploration with a loading state, a clear result count, and an empty state when nothing matches. Provide reset to the saved analysis scope. Persisting a changed report scope requires an explicit save into a configuration version.

## Review exploration filters

Within the review evidence section, support property, publication date, rating, original language, theme, sentiment, and text search where available. Show active filters and allow individual removal or reset. Rating-only reviews remain eligible for rating statistics. Unclassified reviews remain visible and must not be silently discarded.

These filters narrow the evidence view. They do not silently change official report metrics. If a future export of a filtered view is introduced, its scope must be explicitly labelled; that is not the baseline PPTX workflow.

## Export flow

1. Select **Create report** from the Dashboard.
2. Show the saved properties, reporting dates/cutoff, source, frozen dataset, coverage, and commentary review status. If exploration differs from this saved report scope, show that difference before generation.
3. Review strengths, weaknesses, actions, and supporting evidence. The required content follows the eleven-slide baseline; variable comparison counts may add slides, and absent anchors omit their sections.
4. Preview the report and inspect labels, figures, missing-data messages, and actual included sections.
5. Select **Export PowerPoint (.pptx)**. Show queued/generating/ready/failed states and a useful retry action. A failed export does not lose reviewed commentary.
6. Download and retain the immutable export in report history. Each entry records period, created time, author, draft/partial/final status, and data/configuration versions.

An unreviewed report is marked draft. Missing mandatory data prevents a normal final report; an explicitly acknowledged partial export carries visible limitations. Every report binds its configuration, dataset, metric rules, commentary, and template versions. Later refreshes and filters cannot change an existing export.

## Export acceptance

- Q1 2026 exports have correct quarter dates and separately labelled L12M/annual panels.
- Evidence-only filters cannot silently alter the exported population.
- Preview and PPTX show the same frozen values and findings.
- The file opens in desktop PowerPoint; editable text and native chart data are validated during the Gamma pilot.
- Reopening an old report after changing filters or refreshing reproduces its original content.

CSV and PDF exports remain possible future additions.

## Excel export (4 November 2026)

The sidebar offers **Exports**, a dedicated configurable workspace. Comparison dashboards link to it with the current date and dataset scope. The analyst chooses a comparison, quarter/trailing-twelve-month/custom dates, live collected reviews or an existing frozen dataset, included places, sheets, zero to twenty previous years, whether to include editable charts, and the report language. The original seven sheets are the initial preset. Configuration drafts belong to React Hook Form and survive failed downloads.

An existing selected snapshot is reused. From live data, the existing freeze transaction saves the collected review revisions and historical coverage; it does not call the review provider. Creating that new dataset still requires complete coverage of the saved comparison dates for all comparison places. Exported dates require complete coverage only for the places selected in the export. A configuration change requires reloading before creating a new dataset. Successful generation selects the frozen dataset for subsequent exports and retains the configured options. Switching datasets clears place selection so historical membership is chosen explicitly.

The default workbook has seven sheets in reference order: `reviews L12M`, `score L12M`, `score Q{quarter}`, `satisfied L12M`, `satisfied Q{quarter}`, `score anchors`, and `satisfied anchors`. Only selected sheets and places are exported. For non-quarter periods, `score period` and `satisfied period` show the actual selected dates instead of same-quarter history. Optional native clustered-column charts reference worksheet cells and remain editable. Calendar years, trailing twelve complete months, and same-quarter comparisons use the existing dashboard metric rules. Satisfaction is stored as a numeric Excel percentage; ratings retain two decimal places. Zero history years includes only rolling/selected-period rows; otherwise history is bounded by the chosen year count.

Unavailable historical windows remain blank, with chart gaps and an explicit partial-history note. Verified empty windows have zero reviews and unavailable ratings/satisfaction. Selected sheets whose property group is empty explain the empty state. Notes include source, actual window dates, frozen dataset ID/configuration version/time, coverage limitations, and rated-review sample sizes. Visible report labels support Italian and English; sheet names follow the supplied template. Sentiment is deferred.

Downloads are generated on demand from the frozen dataset; this addition does not implement the separate PowerPoint report-history workflow.

## Worksheet customization (5 November 2026)

The original seven sheets are a starting preset. Each worksheet can be renamed, reordered, removed or added back (up to seven). Its controls select Reviews, Score, or Satisfied (4–5 stars), a place group within the globally included places, the shared reporting period, L12M, annual history plus L12M, monthly trend, or quarterly history. Quarterly worksheets have independent Q1–Q4 and year selectors; zero history years exports only that quarter. Excel chart inclusion and history depth are configurable per worksheet. Worksheet names must satisfy Excel restrictions and be unique without regard to case.

Monthly windows are clipped to the shared reporting dates. A covered month with no reviews shows zero volume and unavailable scores; uncovered history remains blank. Coverage is checked for the worksheet's own place group. The report keeps the worksheet order and source window dates in its sample-size table. Independent quarter metrics are read from the immutable review snapshot and included in the frozen PowerPoint data at enqueue time. PowerPoint uses the same worksheet configuration and values; its native charts remain enabled independently of the Excel chart toggles. Existing frozen reports without worksheet settings retain their original preset.

## Saved export settings (5 November 2026)

**Save configuration** stores the current places, worksheet order and settings, reporting dates, and language in this browser, separately for each signed-in account and comparison. Reopening Exports restores the saved configuration; explicit dates in an incoming dashboard link take precedence. Dataset selection remains in the URL. Places no longer present in the selected dataset are removed from the restored selection. Browser storage errors retain the draft and show a retryable error; clearing browser data removes saved configurations. Reset restores the initial preset as a draft; Save configuration replaces the previously saved configuration.
