# PRD 02: Review acquisition and persistence

Status: draft. Traces FR04, FR09 and AC03, AC08 in the [source specification](../../Retail_Review_Analytics_Internal_Specification%20%281%29.docx).

## Outcome

Collect source reviews for all selected listings and windows in the background, preserve what was actually observed, and make partial coverage visible before metrics or reports are trusted.

## Collection scope (confirmed 3 November 2026)

Collection starts from one saved property and runs independently of any analysis. The property owns its collection history and frozen datasets. Live analyses reuse deduplicated review revisions from all finished property snapshots. Collection is manual: opening a view or changing the selected period never queues work. Users explicitly collect or refresh from My Places, or choose “Retry missing dates” in an analysis. Report preparation separately freezes revisions, contributing snapshot IDs, and coverage diagnostics, and requires coverage for every included listing in the saved report period. Missing properties or incomplete date coverage are disclosed per source. Refreshing a property never rewrites an earlier analysis snapshot.

## Required behavior

| ID | Requirement |
|---|---|
| DATA-01 | Start an asynchronous collection for one saved property. Surface queued, running, complete, partial, and failed states without blocking search or setup. |
| DATA-02 | Ask the provider for available history covering the selected window and relevant annual/quarter comparisons. Record requested windows, observed earliest/latest dates, counts, truncation signals, provider errors, and collection timestamps per listing. A provider success response alone does not prove completeness. |
| DATA-03 | Normalize listing identity, source review ID, rating, publication time, original text/language, URL, opaque reviewer ID when available, collection run, and provider version. Preserve rating-only records. |
| DATA-04 | Refresh idempotently. Deduplicate by source and stable review ID with listing consistency checks. Detect changed source records when exposed; preserve revisions so old reports remain reproducible. A fallback for missing stable IDs needs source-specific validation. |
| DATA-05 | Freeze an explicit set of review revisions and coverage diagnostics into a dataset snapshot for each calculation/export. An export points to this snapshot, not to live mutable review rows. |
| DATA-06 | Authenticate analysts, restrict analysis/report/diagnostic access to authorized users, keep provider and model credentials on the server, and log runs, failures, duplicate counts, missing IDs, costs where available, and exports. |
| DATA-07 | Retries must not duplicate reviews or silently overwrite accepted commentary. Failed and partial runs produce actionable messages and can be retried. |

## Provider contract

An adapter accepts source listing identity and requested windows and returns normalized records plus diagnostics. Google is the initial source. The chosen POC collection service is Apify; its actor, available fields, history depth, terms, and reliability must be confirmed by the pilot. TripAdvisor and other sources are unresolved and must remain separate if added. Reviewer IDs only match within the same source and must be stored as opaque identifiers.

## Data integrity

The source review key is `(source, sourceReviewId)` when a stable ID exists. A conflicting listing for the same key is an exception to investigate. Existing observations must not be rewritten in place when source content changes. A fresh scrape cannot recreate deleted reviews or past revisions that were never captured. Collection history must state this limitation.

## Acceptance examples

- Running the same collection twice yields no duplicate source reviews; both runs and their diagnostics remain inspectable.
- A partial actor run gives a partial dataset with a named gap, not a green completion badge or deceptively complete metrics.
- A failed listing can be retried without losing successful listings or earlier frozen reports.
- A report made before a source review edit still resolves the review revision and metrics used at export.

## Pilot gate

Measure Fiumara Shopping, one manually chosen competitor, one anchor, and a small cross-country discovery sample. Capture historic date depth, returned review IDs and reviewer IDs, pagination/truncation, refresh changes, runtime, and cost. Do not promise Monitora historical parity before this evidence exists.

## Coverage reuse (3 November 2026)

Coverage is a union of intervals backed by finished, uncapped, fully imported successful provider collections without skipped rows or missing review IDs. Requested dates, observed publication dates, collection timestamps, and provider scope remain distinct. Legacy collections lacking evidence are unverified. Today and future days do not have full-day coverage.

Explicit missing-date requests are durable per property and normalized elapsed date window, capped at 10,000 reviews. Active jobs are shared across tabs and analyses; failures, uncertain starts, and capped results require explicit retry rather than repeated paid runs. Collection requests use newest-first ordering from the earliest missing date without an end-date filter; extending older coverage can rescan newer reviews. New collections record the provider scan start and last complete UTC day, retain newer returned review observations in their immutable property snapshot, and reuse the wider scope only when completeness diagnostics support it. Historical trend panels do not trigger additional collection. Narrower refreshes never discard older stored evidence.
