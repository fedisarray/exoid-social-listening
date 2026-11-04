# PRD 03: Analytics workspace and review evidence

Status: draft. Traces FR05–FR07 and AC04–AC06 in the [source specification](../../Retail_Review_Analytics_Internal_Specification%20%281%29.docx).

## Outcome

The Dashboard makes review measures, comparison windows, source coverage, shared reviewers, and the underlying reviews inspectable from one saved analysis.

## Workspace

The proposed navigation has overview, competitors, anchors, shared reviewers, reviews, themes/sentiment, findings, and report sections. This is a screen arrangement, not a new requirement for eight separate pages. Every view shows the selected configuration version, dataset snapshot, source, dates, collection status, and sample sizes. Exploration filters never silently alter a previously frozen report.

The saved-comparison library shows the primary property, property count, saved reporting period, configuration version and last update. Search uses the analysis name or primary property. Each analysis opens to a compact property comparison table; individual property details remain expandable. Local section links preserve URL filters, and date exploration is separate from the saved configuration. Historical datasets show their configuration mismatch before the comparison table.

## Deterministic metrics

| Measure | Calculation and display rule |
|---|---|
| Review volume | Count distinct eligible source reviews in a stated listing/window. Rating-only reviews count. |
| Average rating | Sum valid 1–5 ratings / number of rated reviews. Show the denominator; no score if zero. |
| Satisfied reviews | Number of rated reviews with 4 or 5 stars / all rated reviews. The source label says “satisfied reviewers”; its unit is reviews. |
| Text reviews | Count records with nonempty original text. |
| Themes and sentiment | Count by review, allow multiple themes per review; classify positive, negative, mixed, or unclassified. Show classification coverage and each percentage's denominator. |
| Change | Rating delta is absolute score difference; satisfaction delta is percentage points; volume change states whether it is count or percent. |

Rollups are calculated from raw sums and counts, never unweighted averages of monthly scores or percentages. Show monthly selected-period trends, full calendar-year history, and selected quarter versus the same quarter in earlier years where data exists. Historical data from 2022 is displayed only if source coverage supports it. Missing, incomplete, and zero are distinct states. Store precise values; proposed display is two decimals for rating and one decimal for percentages.

## Shared reviewers

For the primary listing A and each competitor B, build sets of distinct, non-null opaque reviewer IDs from the **same source and same labelled time window**. Show `|A ∩ B|`, `|A ∩ B| / |A|`, and `|A ∩ B| / |B|` separately. Example: A has 100 identified reviewers, B has 40, and 20 overlap; display 20, 20%, and 50%. Show the identified reviewer counts and coverage relative to all eligible reviews. Rating subgroup scores use reviews by shared IDs on each listing. Handling multiple reviews by one reviewer on one listing (proposed: latest eligible) requires source validation. Zero denominators make overlap unavailable; missing IDs are excluded from overlap but remain in ordinary rating metrics. The report defaults to trailing 12 complete months; other windows need clear labels.

Overlap measures shared source identities, not visits, direction of travel, or market share. Language is not nationality.

## Evidence inspection

The analyst can search and filter individual reviews by listing, dates, rating, original language, theme, and sentiment where fields are available. Each item shows original text, rating, publication date, source, and a source link when available. Star dissatisfaction (1–3) is distinct from negative text sentiment. Derived themes and sentiment carry model/rule versions and an unclassified state.

## Acceptance examples

- Independent fixture checks volume, average, satisfaction, rating-only records, date edges, weighted rollups, missing values, and quarter/year windows.
- Shared-reviewer fixture verifies 20/100 and 20/40, missing IDs, zero denominators, and subgroup scores.
- Clicking a finding's metric/review evidence opens the stated data in the same frozen scope.
- A filter change updates the exploration view and labels its scope without changing an earlier report.

## Live exploration and coverage (3 November 2026)

Without an explicit snapshot selection, exploration immediately uses all finished property collections. The view always shows covered and missing intervals for each included place; role display filters do not change coverage requirements. If any place lacks selected-period coverage, comparison metrics, evidence, and shared-reviewer results are withheld until the user explicitly requests collection and the elapsed gaps are covered. Opening a view or changing dates never starts collection. A covered empty period is zero, not missing. Annual, same-quarter, and rolling comparisons independently require complete coverage across all included places for their respective windows.

Report datasets remain immutable, including their review revisions, source snapshot provenance, and coverage diagnostics. Opening a frozen dataset never starts collection, and changing live dates does not rewrite any saved report.

## Review indicators (4 November 2026)

Overview alone shows the Review indicators table: rating change (current minus previous average), 1–2-star share of rated reviews, percentage review-volume change, primary-minus-competitor rating gap, and the same gap for shared identified reviewers. Shared reviewers also shows its gap beside subgroup ratings. Gaps are rating points; positive values favor the primary place. Quarter changes compare the preceding calendar quarter, trailing 12-month changes compare the preceding 12 complete months, and custom periods compare the preceding equal number of UTC days. Both windows need complete coverage; zero prior review volume makes percentage growth undefined. Zero rated reviews makes the low-rating share unavailable. Frozen datasets use only frozen evidence and coverage. Topic sentiment remains a subsequent text-analysis pipeline.
