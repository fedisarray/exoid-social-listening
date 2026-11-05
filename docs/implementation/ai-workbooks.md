# Saved snapshot workbooks for comparison AI

AI uses the source snapshot IDs recorded by the selected prepared dataset. It never substitutes a newer snapshot or the latest mutable review revisions. Existing prepared datasets gain workbook access without reimporting their source snapshots.

The workbook contains:

- **Snapshot index:** snapshot identity, version, creation time, requested dates, total rows, text rows, selected-period rows and selected-period text rows. Rating-only reviews are included in total rows. Counts across snapshots overlap.
- **Sxx properties:** frozen listing identities, labels and roles, full-snapshot and selected-period counts, rating/satisfaction facts, identified reviewer counts and coverage intervals.
- **Sxx shared reviewers:** shared identifiable Google reviewers, both directional percentages and their denominators, and associated ratings, using the existing dashboard metrics.
- **Sxx Pxx reviews:** one complete review sheet per property per snapshot, retaining source review ID, frozen revision ID, date, rating, full original text, language, source URL and selected-period eligibility.
- **Methodology:** count definitions, missing values, coverage, overlap, period boundaries and citation rules.

The **Download AI workbook** link in **Review data** exports these sheets as `.xlsx`. Claude receives the same workbook's structured sheet index and methodology, then reads named sheets using a server-side tool. The API is not asked to interpret opaque Excel binary bytes. Tool reads return exact matching-row counts, original Excel row numbers and bounded pages; search is a literal case-insensitive substring over text cells. Review reads default to the selected period. Pagination never implies the entire sheet has been read.

The original 40 relevance-selected reviews remain introductory examples. They are not the source for totals. Claude can answer per-snapshot count questions from the index and inspect property/shared-reviewer sheets or full source review pages for further questions. A request allows up to eight model turns. Claims requiring more evidence must disclose the limitation rather than imply every row has been read.

Snapshot reads use the authenticated organization's caller-bound database client and explicit snapshot scope. Frozen review rows use explicit pagination to avoid PostgREST response truncation. Workbook download repeats access validation and is private and uncached. All cells and tool results are untrusted source data. Workbook citations are accepted only when the revision ID exists in a selected-period sheet and the quotation is an exact substring; source sheet and Excel row are attached by the server.

No external file uploads or cross-snapshot unique totals are implied. Repeated reviews across snapshots remain separate observations. Unavailable shared-reviewer metrics remain null and coverage gaps remain visible.
