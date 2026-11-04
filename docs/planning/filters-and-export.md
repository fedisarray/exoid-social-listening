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

The comparison dashboard offers **Export Excel** for a selected calendar quarter. The scope dialog shows the selected quarter, saved report dates, and the selected dataset when frozen. All places are included regardless of the role filter. Non-quarter exploration asks the analyst to select a quarter before downloading.

An existing selected snapshot is reused. From live data, the existing freeze transaction saves the collected review revisions and historical coverage; it does not call the review provider. Both the saved report dates and the exported quarter need complete coverage. A configuration change requires reloading before creating a new dataset. After successful generation the dashboard selects the exported snapshot.

The workbook has exactly seven sheets in reference order: `reviews L12M`, `score L12M`, `score Q{quarter}`, `satisfied L12M`, `satisfied Q{quarter}`, `score anchors`, and `satisfied anchors`. Each contains a native editable clustered-column chart linked to its worksheet cells. Calendar years, trailing twelve complete months, and same-quarter comparisons use the existing dashboard metric rules. Satisfaction is stored as a numeric Excel percentage; ratings retain two decimal places.

Unavailable historical windows remain blank, with chart gaps and an explicit partial-history note. Verified empty windows have zero reviews and unavailable ratings/satisfaction. Anchor sheets remain present when no anchors exist and explain the empty state. Notes include source, actual window dates, frozen dataset ID/configuration version/time, coverage limitations, and rated-review sample sizes. Visible report labels support Italian and English; sheet names follow the supplied template. Sentiment is deferred.

Downloads are generated on demand from the frozen dataset; this addition does not implement the separate PowerPoint report-history workflow.
