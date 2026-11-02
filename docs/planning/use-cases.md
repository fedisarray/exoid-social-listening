# Use cases

Status: draft. Primary actor is an authenticated analyst unless noted. Preconditions, alternate paths, and durable results are part of each case. IDs trace to the [source specification](../../Retail_Review_Analytics_Internal_Specification%20%281%29.docx).

| ID | Goal and main flow | Alternate / failure path | Result and trace |
|---|---|---|---|
| UC01 | **Find a property.** Enter name/location and optional country; inspect source results with address/country; select exact listing. | Ambiguous names require explicit choice; no match permits URL entry or a clear failure. | Confirmed source listing identity. FR01/AC01. |
| UC02 | **Resolve a listing URL.** Paste source URL; system resolves source and listing ID; analyst confirms displayed identity. | Unsupported or ambiguous URL returns actionable error; no silent name-only match. | Confirmed listing. FR01/AC01. |
| UC03 | **Create comparison.** Name analysis, assign one primary, optional additional own, manual competitors and anchors, labels and order. | Duplicate/conflicting roles require correction; no primary prevents runnable save. | Saved configuration version. FR02/AC02. |
| UC04 | **Set period.** Choose quarter, last 12 complete months, or custom dates; inspect explicit boundaries/cutoff. | Invalid range blocked; insufficient source history later becomes a coverage state. | Saved period definition applied consistently. FR03/AC02. |
| UC05 | **Reopen/edit analysis.** Open saved analysis; inspect restored roles/dates; edit and save. | Prior report stays attached to previous configuration. | New configuration version, old reports intact. FR02/AC02/AC08. |
| UC06 | **Collect reviews.** Start job; system processes listings asynchronously, normalizes reviews and publishes per-listing progress. | Provider truncation, missing IDs, or listing failure yield partial/failed state and diagnostics. | Collection run and candidate dataset. FR04/AC03. |
| UC07 | **Refresh/retry.** Rerun one or more listings; system deduplicates and records changed observations. | Repeated job or partial retry cannot duplicate records or rewrite an old snapshot. | New run and optional new snapshot. FR04/AC03/AC08. |
| UC08 | **Read comparison dashboard.** Select saved analysis/snapshot; see volume, rating, satisfaction, trends, years, quarter and sample sizes. | Missing/incomplete history appears as unavailable/partial, not zero. | Inspectable deterministic metrics. FR05/AC04. |
| UC09 | **Inspect shared reviewers.** Select primary and competitor; see count, two directional shares, subgroup scores, ID coverage, window. | No IDs or zero denominator shows unavailable and reason. | Interpretable overlap evidence. FR06/AC05. |
| UC10 | **Investigate reviews.** Filter/search by listing, date, rating, language, theme, sentiment; open source evidence. | Unavailable classification field is disclosed; filters do not mutate frozen reports. | Scoped evidence view. FR07/AC06. |
| UC11 | **Generate findings.** Request strengths/weaknesses/actions; system supplies metric/review links and uncertainty. | Unsupported claim or prompt injection in review text is rejected or flagged. | Versioned draft findings. FR07/AC06. |
| UC12 | **Review findings.** Edit/add/remove findings, mark reviewed, or regenerate candidates. | Regeneration preserves accepted manual edits absent explicit replace; new data prompts re-review. | Reviewed commentary version. FR07/AC06/AC08. |
| UC13 | **Preview/export report.** Choose frozen version; inspect slides; export PPTX with source/period/sample labels. | Missing mandatory data blocks final; explicit partial acknowledgement permits marked partial; unreviewed exports marked draft. | Immutable report/export version. FR08/AC07/AC08. |
| UC14 | **Audit old report.** Open previous export; inspect configuration, dataset, metric rules, findings, and diagnostics. | A later refresh cannot change it; unavailable historical source records are disclosed. | Reproducible record. FR08–09/AC08. |
| UC15 | **Control access and recover failure.** Authorized analyst resumes work or retries failed job; system logs useful error. | Unauthorized user cannot read another analysis/report; secrets remain server-side. | Persistent, auditable work. FR09/AC03. |

## End-to-end scenario: Fiumara

1. Confirm Fiumara Shopping as primary and Fiumara Entertainment as an additional own listing. Add L'Aquilone, Waterfront, Mercato Corso Sardegna as competitors and Tuday Conad, MediaWorld, UCI Cinemas as anchors only after confirming their actual source listing IDs.
2. Set a calendar quarter and common report cutoff. Save the configuration.
3. Collect reviews; inspect each listing's coverage before freezing a dataset.
4. Review deterministic comparisons, shared reviewer identity coverage, and source reviews. Draft and review findings.
5. Preview and export a PPTX. Reopen it after refresh to confirm figures and commentary are unchanged.

This scenario defines workflow validation, not a promise that today's provider can reconstruct the exact historical workbook or deleted reviews.
