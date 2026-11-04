# Decisions, unknowns, and validation gates

Status: draft. “Selected” records the user's planning choice; it does not imply technical feasibility has been proven.

| Area | Current decision | Validation or unresolved point |
|---|---|---|
| Product navigation | Analysis setup and Dashboard are the two primary areas. | Evidence, findings, and report workflow remain in scope within Dashboard. |
| Organization access | One organization per user; owner/admin/member roles; shared workspace data. | Backend foundation implemented; organization management screens and invitations are deferred. Each organization stores its own nullable report template ID. |
| Frontend | Next.js 16. | Pin a patched release and choose UI/design approach at implementation. |
| Local backend | Local Supabase for database, authentication, and private files. | Confirm container runtime, persistence/backup, local auth configuration, and eventual deployment model. External APIs still process data remotely. |
| Collection | Apify for POC; Google review source first. | Choose/validate actor, IDs, history, pagination, coverage signals, terms, cost, and refresh behavior. TripAdvisor remains optional. |
| Orchestration | Mastra. | Configure durable job/workflow state explicitly; database persistence does not automatically persist Mastra executions. |
| AI | OpenRouter with GPT-6 Luna for grounded draft findings. | Verify model availability and cost at build time; protect untrusted review text and preserve manual edits. Official metrics remain deterministic. |
| Slides | Gamma API PPTX generation. | Pilot exact figures, editable text, native editable charts with embedded data, variable layouts, and desktop PowerPoint compatibility. |
| Dates | Quarter, last 12 complete months, custom period; common cutoff. | Confirm local listing timezone rule for day/month grouping. |
| Overlap | Same-source opaque IDs, trailing 12 complete months for report. | Confirm provider reviewer IDs, multiple-review rule, and any Monitora-specific denominator/window before claiming parity. |
| Report language | Unresolved. | English may be a prototype default but is not confirmed. Confirm UI and PPTX languages/template. |
| Operations | Unresolved. | Analyst roles, hosting, volume, budgets, retention, refresh cadence, performance target, release date, and measurable time saving. |

## Gates before full implementation commitment

1. **Source feasibility:** Fiumara plus one competitor/anchor and European search sample reveal stable listing/review/reviewer IDs, history depth, completeness signals, runtime, and cost.
2. **Metric fixture:** independently check rating-only reviews, date edges, weighted totals, overlap, missing identities, and partial data.
3. **PPTX fixture:** export a known dataset through Gamma, open it in desktop PowerPoint, inspect exact figures, edit chart data and text, and check all slide layouts. If it fails, change the generator or revisit the editable-chart requirement.
4. **Historical reconciliation:** the original workbook is now inspected; see the [workbook analysis](../../references/fiumara-q1-2026-workbook-analysis.md). Obtain the original Fiumara PPTX and source observations/denominators before claiming numerical parity. The workbook confirms the slight CC Q1 decline and leaves L12M boundaries and several denominators unspecified.
5. **Acceptance:** run AC01–AC08 with frozen evidence and confirm old exports survive configuration edits and refreshes.

The described 2–3 weeks for about 32 quarterly reports is a stakeholder estimate, not a measured baseline or committed delivery target. March 2027 is not a confirmed release date.
