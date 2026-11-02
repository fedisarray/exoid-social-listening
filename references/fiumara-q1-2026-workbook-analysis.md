# Fiumara Q1 2026 workbook analysis

Reviewed: 2 November 2026. Source inspected read-only: `/Volumes/DevSSD/Developer/Projects/Attachments-example social listening (CONFIDENTIAL)/Tabs_Monitora_Fiumara_Q1_2026.xlsx`.

## What this output contains

Seven visible sheets contain manually stored aggregate values, with seven native Excel clustered column charts linked to those cells. There are no formulas in those sheets, source review records, listing IDs, review dates, reviewer IDs, or collection diagnostics. This is an output reference, not enough evidence to reproduce the original extraction. No worksheet autofilters, data validation selectors, or PivotTables were found. Changing quarters in our app must recompute from dated reviews; this workbook has separate prebuilt outputs.

| Sheet | Rows | Columns / purpose |
|---|---|---|
| reviews L12M | 2022, 2023, 2024, 2025, L12M | Review volumes for two Fiumara series and three competitors |
| score L12M | Same periods | Average ratings for the same properties |
| score Q1 | Q1 2022 through Q1 2026 | Quarter ratings; A7 additionally contains Q2 2026 with no values |
| satisfied L12M | 2022–2025 and L12M | Satisfaction percentages for the same properties |
| satisfied Q1 | Q1 2022 through Q1 2026 | Quarter satisfaction percentages |
| score anchors | 2022–2025 and L12M | Tuday Conad, Media World, UCI Cinemas ratings |
| satisfied anchors | 2022–2025 and L12M | Anchor satisfaction percentages |

The column headers are FIUMARA CC, FIUMARA CD, L'AQUILONE, WATERFRONT *, and MERCATO SARDEGNA. Mapping CC to Shopping and CD to Entertainment follows the internal specification, not listing identity fields in this workbook.

## Selected outputs

| Property | L12M reviews | L12M rating | L12M satisfaction | Q1 2026 rating | Q1 2026 satisfaction |
|---|---:|---:|---:|---:|---:|
| Fiumara CC | 918 | 4.29 | 83.1% | 4.21 | 80.3% |
| Fiumara CD | 195 | 4.19 | 77.9% | 4.45 | 88.6% |
| L'Aquilone | 196 | 4.08 | 76.0% | 4.19 | 80.6% |
| Waterfront | 68 | 4.41 | 81.8% | 4.41 | 81.8% |
| Mercato Sardegna | 238 | 4.30 | 85.7% | 4.36 | 93.3% |

These values come from B6:F6 in the five corresponding visible property sheets. Satisfaction cells store numbers on a 0–100 scale (83.1, not 0.831); any reference import must normalize explicitly.

For anchors, B6:D6 shows Tuday Conad 3.69 / 53.1%, Media World 4.06 / 76.2%, and UCI Cinemas 4.12 / 78.2% for L12M rating / satisfaction. No anchor sample counts are provided.

## Findings and limits

- Fiumara CC Q1 rating changes from 4.22 in 2025 to 4.21 in 2026: −0.01. Satisfaction changes from 81.0% to 80.3%: −0.7 percentage points. This does not support a narrative of Q1 improvement for CC.
- Fiumara CD Q1 rating changes from 4.20 to 4.45: +0.25. Satisfaction rises from 80.4% to 88.6%: +8.2 percentage points. Keep the two own series distinct.
- Waterfront historical 2022–2025 cells are blank; its L12M and Q1 2026 values are populated. Charts specify gaps for blanks. The asterisk has no explanation in the inspected cells; neither the cause of missing history nor its opening date can be inferred.
- L12M boundaries and collection date are not stated in the visible data. For a Q1 2026 report ending 31 March, 1 April 2025–31 March 2026 is the planned convention, not verified workbook metadata.
- Q1 review counts, rating sums, and 4–5-star counts are absent. Scores and satisfaction cannot be independently recomputed. L12M volume is not a Q1 denominator.
- Waterfront's 81.8% cannot be obtained by an integer satisfied count divided by exactly 68 reviews with normal one-decimal rounding. A different rated-review denominator, population, period, or source rule may explain it; this is a reconciliation question, not proof of an error.
- There are no monthly series, shared-reviewer outputs, review evidence, Fiumara sentiment classifications, or narrative findings here. These remain app requirements from the specification.
- No stored Excel error cells were found. That does not validate the aggregate values or their provenance.

## Hidden benchmark

The hidden `SENTIMENT_benchmark` sheet contains restaurant-chain data, 21 formulas, and a scatter chart. Its positive-opinion percentage uses positive opinions / total opinions; “opinions” and “reviews” are distinct units. A review can produce multiple opinions. This unrelated sheet does not define Fiumara scope or replace the review-based theme rules in the PRD. Any future opinion-level feature would need a separate definition and denominator.

## App behavior confirmed or clarified

1. Offer a year plus Q1/Q2/Q3/Q4 selector, show actual dates, and compare the selected quarter with the same quarter in earlier years. The empty Q2 row is not Q2 evidence.
2. Maintain distinct reporting contexts: selected quarter, trailing 12 complete months ending at the reporting cutoff, and full calendar-year history. A Q1 selection does not turn every report slide into a Q1-only measure.
3. A full-year filter is a proposed convenient extension to the existing annual-history requirement. Quarter, trailing 12 months, and custom range remain the explicit baseline presets.
4. Show property and anchor comparisons as separate groups, with separate own-property series. Match the workbook's seven visible chart subjects while supporting variable comparison counts.
5. Display missing history as unavailable and show period/sample/coverage labels. Recompute all values from dated normalized reviews rather than extrapolating these rounded aggregates.
6. Use these observed values as presentation/reference fixtures. Validate calculation correctness with controlled raw-review fixtures until the original source observations and denominators are available.

The workbook is now available; the original Fiumara PPTX and review-level extraction are still missing from the planning evidence.
