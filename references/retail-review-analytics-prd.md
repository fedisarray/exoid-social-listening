# Retail review analytics PRD

Source: [Retail Review Analytics Internal Specification](../Retail_Review_Analytics_Internal_Specification%20%281%29.docx)
Source version: 0.1, 2 November 2026
Reviewed: 2 November 2026

## Authority and scope

Use this PRD as the primary planning baseline. Monitora and UrbiStat research provides context and behavior references; features on those websites do not automatically enter our scope. Preserve the PRD's distinction between baseline requirements, proposed implementation choices and unresolved decisions.

The goal is a standalone application for analysts to find European retail properties, collect and analyze reviews, compare manually chosen properties and generate PowerPoint reports with editable commentary. Fiumara is the initial validation case. European search coverage does not require a complete preloaded European property inventory.

The current process reportedly takes two to three weeks for roughly 32 reports per quarterly cycle. These are stakeholder estimates; portfolio size, future volume and a measurable time-saving target still need confirmation.

## Core workflow and requirements

| Requirement | Planning baseline |
|---|---|
| FR01 Search | Search by name and location with country refinement, or resolve a listing URL. Show enough identifying information for the analyst to confirm the exact listing. |
| FR02 Configuration | Persist the primary listing, additional own listings, manual competitors, selected tenant stores/anchors, labels, relationships and ordering. Never select competitors automatically. |
| FR03 Period | Calendar quarter, last 12 complete months or custom dates. Explicit dates and a common reporting cutoff across properties. |
| FR04 Acquisition | Background collection with queued, running, complete, partial and failed states; refresh without duplicates; preserve coverage diagnostics and dataset versions. |
| FR05 Metrics | Calculate official figures deterministically from normalized reviews. Preserve rating-only reviews, consistent denominators and correct date boundaries. |
| FR06 Shared reviewers | Match opaque reviewer IDs within the same source and time window. Show counts, both directional shares, subgroup scores and identity coverage. |
| FR07 Evidence and commentary | Overview, competitor and anchor comparisons, overlap view and searchable reviews. AI drafts evidence-linked findings and actions; analysts review, edit or remove them. Preserve manual edits during regeneration. |
| FR08 Reporting | Generate reusable PPTX reports from frozen data and reviewed commentary. Editable text and native charts with embedded data are the proposed baseline. |
| FR09 Reliability | Authentication, persistent work, authorized access, server-side secrets, actionable errors, retries, acquisition diagnostics and export logs. |

## Initial Fiumara configuration

- Primary own listing: Fiumara Shopping.
- Additional own listing: Fiumara Entertainment; keep its series separate from Shopping.
- Manually selected competitors: L'Aquilone, Waterfront and Mercato Corso Sardegna.
- Selected anchors: Tuday Conad, MediaWorld and UCI Cinemas.
- Confirm the exact source listing IDs during setup. Shared reviewer comparisons default to the primary own listing.

## Data and metric rules

Google reviews are the required Fiumara baseline. Apify is a suggested provider, subject to an acquisition pilot. TripAdvisor is optional and unresolved. Keep source distinctions in storage and analysis.

Persist listings, source reviews, collection runs, analysis configurations and immutable report/dataset versions. Deduplicate by source plus stable review ID, with listing checks. Do not match reviewers using their display names or avatars. A current scrape cannot reconstruct deleted reviews or earlier review versions that were never collected.

- Review count: distinct eligible review records.
- Average score: sum of valid ratings divided by the number of rated reviews.
- Satisfied reviewers: rated reviews with four or five stars divided by all rated reviews. The calculation unit is a review despite the display label.
- Reviews with text: reviews with nonempty original text.
- Themes and sentiment: review-based theme counts; a review may mention multiple themes. Disclose the denominator for every percentage.
- Shared reviewers: intersection of distinct identified reviewer IDs. Divide separately by each property's identified reviewer count for directional shares. Missing IDs are excluded from overlap only.
- Period rollups: recompute from review sums and counts; do not average monthly averages or percentages without weighting.
- Score changes: absolute score differences. Satisfaction changes: percentage points. Missing values remain distinct from zero.

Local listing timezones for date boundaries and month assignment are proposed and need confirmation. Store UTC timestamps. The reporting cutoff determines trailing windows and historical comparisons, rather than the export date.

Reviewer overlap does not establish visits, visit direction or market share. Review language does not prove nationality. Star-based dissatisfaction and negative textual sentiment are separate concepts.

## Report content

The supplied reference deck is described as eleven slides: cover; contents; reviewed findings/actions; review volume; trailing and annual scores; quarter scores; trailing and annual satisfaction; quarter satisfaction; shared reviewers; anchor scores; anchor satisfaction.

Competitor and anchor counts must be variable. Split crowded slides, omit unselected anchor sections, show missing overlap data explicitly, and label partial or unreviewed reports appropriately. Each export retains its own values, commentary, metric rules and source snapshot after later refreshes.

## First planning milestone

Validate acquisition on Fiumara, one competitor and one anchor, plus a small European search sample. Measure history depth, reviewer-ID availability, refresh behavior, completeness diagnostics, runtime and costs before selecting a provider or committing delivery targets. Then sequence normalized storage and deterministic metrics, analysis views, overlap, commentary review and PowerPoint generation.

## Open decisions and evidence gaps

- Additional sources beyond Google; provider selection; refresh cadence; retention and coverage requirements.
- Monitora overlap denominator, time-window and identity rules; validate before claiming parity.
- Report language, visual template, chart editability, custom-period layout and interface language.
- Analyst accounts, deployment environment, access model, operating volume, budget and release date. March 2027 is not a confirmed commitment.
- The source document references a call transcript, an eleven-slide Fiumara PPTX, an Excel workbook and a screenshot archive. The Excel workbook has now been supplied and inspected; see [Fiumara workbook analysis](fiumara-q1-2026-workbook-analysis.md). The other original supporting files remain unavailable; three call screenshots are embedded in the PRD and were inspected.
- The PRD flags conflicting report narrative and workbook figures: Q1 improvement versus a small score decline, inconsistent Entertainment comment counts, and different Waterfront figures from different collection windows. Reconcile originals before using them as acceptance fixtures.
- The unrelated restaurant sentiment workbook tab does not define product scope. Shared reviewer reconciliation requires reviewer-level evidence absent from the described aggregate workbook.

## Acceptance focus

The PRD's AC01–AC08 cover European search and identity confirmation, configuration persistence, duplicate-safe collection and failure handling, independently calculated metrics, directional overlap, evidence-linked editable commentary, editable accurate PPTX output and immutable historical reports.

This note summarizes the PRD for planning. The original document controls when detail differs.
