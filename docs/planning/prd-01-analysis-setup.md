# PRD 01: Analysis setup

Status: draft. Traces FR01–FR03 and AC01–AC02 in the [source specification](../../Retail_Review_Analytics_Internal_Specification%20%281%29.docx).

## Outcome

An analyst can create, save, reopen, and version an analysis with the exact source listings and reporting dates that will govern every comparison and export.

## Property library (confirmed 3 November 2026)

The default dashboard begins with source listing search and identity confirmation, followed by saved property cards. Properties belong to the analyst workspace independently of analyses. Each card opens the property’s own review workspace and shows its latest collected review count, average rating, rated-review denominator, and a source thumbnail when available. Missing photos and unavailable metrics remain explicit.

Analysis setup selects properties from this saved library, then assigns comparison roles and reporting dates. Saving an analysis does not create or collect a property. Existing saved listings and review snapshots are migrated into the property library without changing earlier analysis snapshots.

## Users and workflow

The analyst finds and confirms source listings from the property dashboard, then names an analysis and selects saved properties. The analyst assigns exactly one primary own property, optionally adds other own properties, manually selects competitors and tenant anchors, labels and orders each series, chooses dates, then saves. Reopening reproduces all selections. Editing creates a new configuration version for subsequent calculations; existing reports stay tied to their prior version.

Fiumara validation: Fiumara Shopping is primary; Fiumara Entertainment is an additional own series, never a competitor. L'Aquilone, Waterfront, and Mercato Corso Sardegna are competitors; Tuday Conad, MediaWorld, and UCI Cinemas are anchors. Source listing IDs must be confirmed rather than inferred from names.

## Requirements

| ID | Requirement |
|---|---|
| SET-01 | Search across European listings by name and location; refine by country; resolve a direct source URL. No complete preloaded inventory is required. |
| SET-02 | Show disambiguating listing fields and require explicit source identity confirmation before saving a role. |
| SET-03 | Exactly one primary own listing. Additional own listings, competitors, and anchors are optional; roles, display labels, order, and listing relationships persist. Competitors are selected manually. |
| SET-04 | Date presets: selected calendar quarter, last 12 **complete** months, and custom start/end. Show inclusive calendar dates and a common cutoff for every listing. |
| SET-05 | Save and reopen an analysis; configuration edits produce traceable versions. Show the version and date scope used by Dashboard and reports. |

## Date behavior

Quarter Q1 2026 means 1 January–31 March 2026. With a 31 March 2026 cutoff, last 12 complete months means 1 April 2025–31 March 2026. Historical quarter comparison uses Q1 in prior years where reviews exist. Storage timestamps are UTC; mapping dates to a listing's local timezone is a proposed rule pending confirmation.

Make the quarter control explicit: select year and Q1, Q2, Q3, or Q4. Selecting Q2 compares April–June with April–June in earlier years. The report retains separate labelled quarter, trailing-12-month, and full-year history panels; a quarter filter does not silently replace all those windows. A full-year preset is a proposed convenience alongside the required annual history, pending scope confirmation. See the [actual workbook analysis](../../references/fiumara-q1-2026-workbook-analysis.md).

## Acceptance examples

- Two listings with the same name in different countries remain distinguishable and persist by source identity, not display name.
- Reopening Fiumara restores separate Shopping and Entertainment series, every manual comparison, order, label, and date.
- Changing the analysis after export leaves the earlier report's configuration and values intact.
- Empty competitor or anchor groups are valid; a missing primary listing or invalid date range cannot be saved as a runnable analysis.

## Boundaries

The setup does not auto-discover competitors or assert that a source listing exists solely because a name search matched. Source coverage and ambiguous URL resolution must be shown as errors or choices.
