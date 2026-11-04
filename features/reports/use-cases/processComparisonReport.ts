import "server-only";
import { buildDetailedPowerPoint } from "../domain/buildDetailedPowerPoint";
import type { ReportWorkerContext } from "@/lib/auth/dal";
import { periodSchema } from "@/features/_shared/schemas/period";
import {
  claimReport,
  updateReport,
  releaseReport,
  nextReportAttempt,
  recordCancelledGeneration,
} from "../repositories/reports";
import {
  startPresentation,
  readPresentation,
  downloadPresentation,
} from "../repositories/presentationProvider";
import { saveReportFile } from "../repositories/reportFiles";
import { frozenReportDataSchema } from "../schemas/frozenReportData";
import {
  reportErrorCodeSchema,
  type ReportErrorCode,
} from "../schemas/comparisonReport";
import { powerPointBrief } from "../domain/powerPointBrief";
import type { ProcessComparisonReportOutput } from "../schemas/processComparisonReportOutput";
export async function processComparisonReport(
  ctx: ReportWorkerContext,
): Promise<ProcessComparisonReportOutput> {
  const report = await claimReport(ctx.db);
  if (!report) {
    const nextAttemptAt = await nextReportAttempt(ctx.db);
    return { worked: false, nextAttemptAt };
  }
  const lease = report.lease_token;
  if (!lease) throw new Error("REPORT_LEASE_MISSING");
  let delay = 5;
  let startSent = false;
  let startedId: string | null = null;
  const fail = async (code: ReportErrorCode) => {
    await updateReport(ctx.db, report.id, lease, {
      status: "failed",
      error_code: code,
      finished_at: new Date().toISOString(),
      lease_token: null,
      lease_until: null,
    });
  };
  try {
    if (Date.now() - Date.parse(report.created_at) > 1800000) {
      await fail("GENERATION_TIMED_OUT");
    } else if (report.status === "starting") {
      // A crash after sending the paid request must never start another generation automatically.
      await fail("START_UNCERTAIN");
    } else if (report.status === "queued") {
      const data = frozenReportDataSchema.parse(report.frozen_data);
      const period = periodSchema.parse(report.period);
      if (report.locale !== "it" && report.locale !== "en")
        throw new Error("PROCESSING_FAILED");
      const prompt = powerPointBrief(
        data,
        period,
        report.locale,
        report.created_at,
      );
      await updateReport(ctx.db, report.id, lease, { status: "starting" });
      startSent = true;
      const remote = await startPresentation(report.template_id, prompt);
      startedId = remote.id;
      await updateReport(ctx.db, report.id, lease, {
        provider_generation_id: remote.id,
        status: remote.unsafeSharing ? "failed" : "generating",
        error_code: remote.unsafeSharing ? "ACCESS_DENIED" : null,
        finished_at: remote.unsafeSharing ? new Date().toISOString() : null,
        attempts: 0,
      });
    } else if (report.status === "generating") {
      if (!report.provider_generation_id) throw new Error("PROCESSING_FAILED");
      const remote = await readPresentation(report.provider_generation_id);
      if (remote.status === "failed")
        await fail(remote.errorCode ?? "GENERATION_FAILED");
      else if (remote.status === "completed") {
        if (!remote.exportUrl) await fail("EXPORT_FAILED");
        else
          await updateReport(ctx.db, report.id, lease, {
            status: "downloading",
            provider_export_url: remote.exportUrl,
            attempts: 0,
          });
      } else
        await updateReport(ctx.db, report.id, lease, {
          attempts: 0,
          error_code: null,
        });
    } else if (report.status === "downloading") {
      if (!report.provider_export_url) throw new Error("EXPORT_FAILED");
      const source = await downloadPresentation(report.provider_export_url);
      const data = frozenReportDataSchema.parse(report.frozen_data);
      const period = periodSchema.parse(report.period);
      if (report.locale !== "it" && report.locale !== "en")
        throw new Error("PROCESSING_FAILED");
      const bytes = data.exportOptions
        ? buildDetailedPowerPoint(
            source,
            data,
            period,
            report.locale,
            report.created_at,
          )
        : source;
      if (bytes.length > 33554432) throw new Error("INVALID_POWERPOINT");
      const path = `${report.organization_id}/${report.id}.pptx`;
      await saveReportFile(ctx.db, path, bytes);
      await updateReport(ctx.db, report.id, lease, {
        status: "completed",
        storage_path: path,
        native_charts: Boolean(data.exportOptions),
        provider_export_url: null,
        error_code: null,
        finished_at: new Date().toISOString(),
        attempts: 0,
        lease_token: null,
        lease_until: null,
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "REPORT_LEASE_LOST") {
      if (startedId)
        await recordCancelledGeneration(
          ctx.db,
          report.id,
          report.organization_id,
          startedId,
        );
      throw error;
    }
    const parsed = reportErrorCodeSchema.safeParse(
      error instanceof Error ? error.message : "",
    );
    let code: ReportErrorCode = parsed.success
      ? parsed.data
      : "PROCESSING_FAILED";
    if (
      startSent &&
      ![
        "TEMPLATE_INVALID",
        "ACCESS_DENIED",
        "USAGE_LIMIT",
        "RATE_LIMITED",
      ].includes(code)
    )
      code = "START_UNCERTAIN";
    const attempts = report.attempts + 1;
    if (
      [
        "START_UNCERTAIN",
        "TEMPLATE_INVALID",
        "ACCESS_DENIED",
        "USAGE_LIMIT",
        "GENERATION_FAILED",
        "EXPORT_FAILED",
        "INVALID_POWERPOINT",
      ].includes(code) ||
      attempts >= 5
    )
      await fail(code);
    else {
      await updateReport(ctx.db, report.id, lease, {
        attempts,
        error_code: code,
        ...(report.status === "queued"
          ? {
              status: code === "RATE_LIMITED" ? "queued" : "failed",
              ...(code === "RATE_LIMITED"
                ? {}
                : { finished_at: new Date().toISOString() }),
            }
          : {}),
      });
      delay = Math.min(60, attempts * 10);
    }
  } finally {
    await releaseReport(ctx.db, report.id, lease, delay);
  }
  const nextAttemptAt = await nextReportAttempt(ctx.db);
  return { worked: true, nextAttemptAt };
}
