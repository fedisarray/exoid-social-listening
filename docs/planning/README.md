# Retail Review Analytics: planning pack

Status: planning baseline, 2 November 2026. The first application foundation is implemented; see [milestone delivery and verification](../implementation/milestone-01.md). Remaining PRDs continue to define subsequent milestones.

## Product goal

Give an analyst one workflow to identify European retail listings, save a comparison set, collect review evidence, calculate repeatable metrics, inspect and review findings, and export a versioned PowerPoint report. The first validation case is Fiumara. The two main application areas are **Analysis setup** and **Dashboard**; evidence, findings, and report creation belong in the Dashboard workspace.

The [internal specification](../../Retail_Review_Analytics_Internal_Specification%20%281%29.docx) is authoritative. [Monitora](../../references/monitora-product-research.md) and [UrbiStat](../../references/urbistat-services-research.md) are product references, not feature commitments. The [scope note](../../references/core-app-scope.md) records the agreed screen emphasis.

The supplied [Fiumara Q1 2026 workbook analysis](../../references/fiumara-q1-2026-workbook-analysis.md) records actual output structure, values, period-filter implications, and reconciliation gaps.

## Documents

| Document | Scope | Specification trace |
|---|---|---|
| [PRD 01: Analysis setup](prd-01-analysis-setup.md) | Search, confirm identities, roles, dates, saved configurations | FR01–03; AC01–02 |
| [PRD 02: Review acquisition](prd-02-review-acquisition.md) | Collection, normalization, diagnostics, history, access | FR04, FR09; AC03, AC08 |
| [PRD 03: Analytics workspace](prd-03-analytics-workspace.md) | Metrics, comparisons, overlap, evidence | FR05–07; AC04–06 |
| [PRD 04: Findings and reports](prd-04-findings-and-reports.md) | AI drafts, review, PPTX and versioning | FR07–09; AC06–08 |
| [Use cases](use-cases.md) | Analyst and system flows, including failures | FR01–09 |
| [Domain class diagram](class-diagram.md) | Logical entities and relationships | FR01–09 |
| [Decisions and validation](decisions.md) | Selected stack, unresolved questions, pilot gates | Cross-cutting |
| [Filters and export](filters-and-export.md) | Dashboard controls, review filters, PPTX preview/download/history | FR03, FR07–09 |

## Proposed delivery sequence

1. Validate search and acquisition with Fiumara Shopping, one competitor, one anchor, and a small European search sample. Measure source identity, history, reviewer IDs, coverage, runtime, and cost.
2. Build saved analysis setup, normalized storage, refresh jobs, frozen datasets, and deterministic metrics.
3. Build Dashboard comparisons, shared reviewers, review inspection, and evidence-linked findings.
4. Validate Gamma PPTX editability against a fixed fixture, then build review, preview, export, and version history.
5. Reconcile the full Fiumara example against source records and run AC01–AC08.

Proposed choices in these documents need validation before being treated as source requirements. No numeric-only scope reduction has been agreed.
