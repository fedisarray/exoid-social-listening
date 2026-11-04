# PRD 04: Reviewed findings and PowerPoint reports

Status: draft. Traces FR07–FR09 and AC06–AC08 in the [source specification](../../Retail_Review_Analytics_Internal_Specification%20%281%29.docx).

## Outcome

Produce an evidence-linked draft that an analyst can edit and approve, then export a reproducible PowerPoint report from frozen figures, commentary, and source coverage.

## Reporting iteration (confirmed 4 November 2026)

Generation follows the current Exports configuration for places, selected sheets, dates, dataset, history and language. The first content section is Key Learnings, followed by one chart page per selected Excel sheet, a separate Shared Visitors L12M page, and sources/methodology. Selecting all seven Excel sheets yields seven detailed chart pages. Native chart data and embedded workbooks reuse the deterministic Excel builder; generated chart screenshots do not satisfy this requirement. Shared Visitors uses the actual L12M window and explicit reviewer denominators. Key Learnings in this iteration are draft metric-backed summaries and review actions; the full reviewed-findings workflow below remains separate.

Users can cancel local report processing or resume an existing job. Cancellation must describe the limit of the remote API and must not imply that remote work or charges have been cancelled. See [implementation and verification](../implementation/powerpoint-reports.md).

## Findings workflow

AI proposes strengths, weaknesses, and actions grounded in selected metric results or specific review revisions. The analyst can edit, add, remove, and mark findings reviewed. A finding stores its origin, evidence links, status, and version. Regeneration creates a new candidate and preserves accepted manual text unless the analyst explicitly replaces it. If the underlying dataset or configuration changes, the proposed rule is to require review again before a final export.

The model must not calculate official totals, invent quotations, claim causes or demographics from reviews, or obey instructions embedded in scraped review text. It should flag sparse or partial evidence. Topics may include parking, safety, cleanliness, facilities, and store mix when supported. Star-based dissatisfaction and text-negative sentiment have separate labels and denominators.

## Export contract

An export binds an analysis configuration version, frozen dataset snapshot, metric-definition version, calculated metrics, reviewed commentary version, template version, generation metadata, and partial/draft status. The analyst can preview and download the PPTX. Exported versions are immutable; a later refresh or edit creates a new version. Unreviewed commentary is visibly labelled **draft**. Missing mandatory data blocks a normal final export; an explicitly acknowledged partial export is marked **partial** and describes gaps.

## Baseline slide content

| # | Content |
|---|---|
| 1 | Cover: property, period, cutoff, source, preparation date |
| 2 | Contents reflecting actual included slides |
| 3 | Reviewed strengths, weaknesses, actions |
| 4 | Trailing 12-month review volume with annual history and comparators |
| 5 | Trailing 12-month and full-year average ratings |
| 6 | Selected quarter rating versus the same quarter in prior years |
| 7 | Trailing 12-month and full-year 4–5-star share |
| 8 | Selected quarter satisfaction versus prior same quarters |
| 9 | Shared reviewer count, both directional shares, subgroup scores, coverage |
| 10 | Anchor trailing 12-month and full-year ratings |
| 11 | Anchor trailing 12-month and full-year satisfaction |

Variable competitor/anchor counts may split crowded slides. If no anchors are selected, omit those sections and update contents. If overlap is unavailable, retain an explanatory section. Custom dates must be labelled with their actual range; historical quarter panels may be omitted with explanation when no quarter applies. Every chart states measure, unit, source, period, and sample size. Trailing 12 months and calendar years must remain distinct.

Editable text and native PowerPoint charts with embedded data are required. The selected provider export produced chart images in the initial inspection, so the application now constructs native chart pages from the deterministic Excel data and retains the organization template cover and styling. Values, embedded workbooks and package relationships are verified, with a LibreOffice render check. Desktop Microsoft PowerPoint editing remains a separate acceptance check.

## Acceptance examples

- AI output cites the exact evidence used; unsupported wording is removable; a malicious review cannot redirect the model's instructions.
- Editing an approved finding and regenerating preserves the edit; an explicit replacement creates a new version.
- A fixed fixture exports all relevant slides, exact metric values, correct labels and missing-data notices; desktop PowerPoint opens it and permits editing text and chart values.
- Old exports remain unchanged and traceable after refresh, filters, configuration edits, and new findings.
