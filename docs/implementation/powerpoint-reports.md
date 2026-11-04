# Comparison PowerPoint reports

PowerPoint generation uses the organization's `report_template_id` and the server-only `REPORT_GENERATION_API_KEY`. User-facing labels, states, errors and download links use neutral reporting language in Italian and English.

## User flow

Open a comparison, choose **Configure PowerPoint**, then use the existing Exports controls to select dates, a saved dataset or a new frozen dataset, places, chart sheets, history years and report language. Generate PowerPoint from the download summary. PowerPoint always includes native charts; the existing Excel-chart checkbox continues to control Excel only.

Each generation stores its configuration, immutable snapshot, aggregate figures, template ID, language and metric-definition version. Later form changes, comparison edits or review collection do not alter old reports. Repeated clicks reuse the comparison's active job. An explicit new version creates a new job and may consume generation credits.

The report contains:

1. The organization template's generated cover.
2. An index reflecting the selected sheets.
3. **Key Learnings**, the first content section, with deterministic metric-backed bullets and an actions block. It does not invent review themes, causes, demographics or quotations.
4. One detailed chart page per selected Excel sheet, in the same order. Selecting all seven sheets produces seven chart pages. Place order, series, historical windows, data labels, number formats, missing values and chart data come from the existing Excel report builder.
5. **Shared Visitors — % OF SHARED VISITORS DURING THE L12M**, using separately computed L12M overlap and both directional denominators. These are identifiable Google reviewers, not measured physical footfall. Incomplete L12M coverage produces an explicit unavailable section rather than selected-period percentages.
6. Sources, coverage and methodology.

Reports remain visibly marked as drafts. Key Learnings are metric summaries and review suggestions; this milestone does not add the separately planned findings editor/approval workflow.

## Detailed, editable charts

The presentation provider's export was inspected and contained image-based charts. New report versions therefore retain the generated organization cover and its master, theme and decorative assets, while constructing chart and information pages as native PowerPoint objects.

Chart XML and embedded `.xlsx` workbooks are derived from the same deterministic builder as Excel exports. Charts have cached values, category/series labels, visible data labels and external-data relationships to their embedded workbooks. In PowerPoint, use **Edit Data** to inspect or change chart values and sample-size tables. The configured historical range is preserved. Unavailable groups retain their page with an explanation.

Old completed reports remain unchanged; they do not acquire native charts retroactively.

## Jobs, cancellation and downloads

Jobs persist `queued`, `starting`, `generating`, `downloading`, `completed`, `failed` or `cancelled`. A leased internal worker starts once, polls, validates the export, builds native chart pages, uploads the file and only then marks the report completed. Public actions never accept identity, privileged clients, provider IDs or template IDs from the browser.

**Cancel report** stops processing in the app, clears the lease and prevents later worker updates from completing the cancelled job. It does not guarantee cancellation of remote generation or reversal of credits: the provider has no documented generation-cancellation API. If cancellation races with a paid start, the returned generation ID is retained for administrative inspection without reviving the job. A completed report cannot be cancelled. **Resume generation** restarts local processing of an existing active job; it does not create another paid request. Interrupted starts become an uncertain failure rather than being sent again automatically.

Completed files are stored in the private `comparison-reports` bucket. `/api/reports/[id]/download` checks current organization membership and creates a short-lived app-storage download URL. Provider URLs and credentials are not exposed in the report UI. The worker authenticates with `REPORT_WORKER_SECRET`; it can also be launched explicitly with `node scripts/report-worker.mjs` to resume pending work after a process restart.

## Verification

Focused disposable checks cover organization isolation, custom-date freezing, duplicate generation, cancellation permissions and lease clearing. Native chart values, series, categories and year labels were compared with the Excel builder, embedded workbooks and package relationships were validated, and a native verification deck was rendered with LibreOffice. It was not inspected in desktop Microsoft PowerPoint.

Worker tests with mocked network boundaries cover one paid-start attempt, polling, native archive completion, immutable input, interrupted-start protection and cancellation during a start. No additional paid request is needed for those tests.

Run `pnpm lint`, `pnpm typecheck`, `pnpm build`, database lint and security advisors when changing this flow. Keep API keys in server-side environment configuration and never commit them. Apply the migration before deploying the matching application.

### Live verification

The initial live generation completed and its file was retained. After restoring the local container services, authenticated desktop and 360px navigation, the private download redirect/file, cross-organization download denial, database lint and security advisors all passed. Cancellation, custom-date freezing and duplicate-job checks passed in the disposable database. Native output and immutable storage retries were separately verified without another paid generation request. The temporary test database and storage file were removed.
