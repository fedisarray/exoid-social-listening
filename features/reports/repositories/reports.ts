import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Tables,
  TablesUpdate,
} from "@/lib/supabase/database.types";
import {
  comparisonReportSchema,
  type ComparisonReport,
} from "../schemas/comparisonReport";
import type { StartComparisonReportInput } from "../schemas/startComparisonReportInput";
type DB = SupabaseClient<Database>;
export async function enqueueReport(
  db: DB,
  input: StartComparisonReportInput,
): Promise<string> {
  const { data, error } = await db.rpc("enqueue_comparison_report", {
    p_analysis: input.analysisId,
    p_expected: input.expectedVersion,
    p_snapshot: input.snapshotId ?? undefined,
    p_period: input.period,
    p_locale: input.locale,
    p_options: { ...input.options, includeCharts: true },
  });
  if (error) throw error;
  return data;
}
export async function listReports(
  db: DB,
  organizationId: string,
  analysisId: string,
): Promise<ComparisonReport[]> {
  const { data, error } = await db
    .from("comparison_reports")
    .select(
      "id,native_charts,analysis_version,snapshot_id,period,locale,status,created_at,finished_at,error_code,lease_until,next_attempt_at",
    )
    .eq("organization_id", organizationId)
    .eq("analysis_id", analysisId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data.map((row) =>
    comparisonReportSchema.parse({
      id: row.id,
      version: row.analysis_version,
      snapshotId: row.snapshot_id,
      nativeCharts: row.native_charts,
      period: row.period,
      locale: row.locale,
      status: row.status,
      createdAt: row.created_at,
      finishedAt: row.finished_at,
      errorCode: row.error_code,
      stalled:
        !["completed", "failed", "cancelled"].includes(row.status) &&
        Date.parse(row.next_attempt_at) < Date.now() - 60000 &&
        (!row.lease_until || Date.parse(row.lease_until) < Date.now()),
    }),
  );
}
export async function findReportDownload(
  db: DB,
  organizationId: string,
  id: string,
): Promise<Pick<
  Tables<"comparison_reports">,
  "status" | "storage_path" | "period"
> | null> {
  const { data, error } = await db
    .from("comparison_reports")
    .select("status,storage_path,period")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
export async function claimReport(
  db: DB,
): Promise<Tables<"comparison_reports"> | null> {
  const { data, error } = await db.rpc("claim_comparison_report");
  if (error) throw error;
  return data[0] ?? null;
}
export async function updateReport(
  db: DB,
  id: string,
  lease: string,
  changes: TablesUpdate<"comparison_reports">,
): Promise<void> {
  const { data, error } = await db
    .from("comparison_reports")
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("lease_token", lease)
    .gt("lease_until", new Date().toISOString())
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("REPORT_LEASE_LOST");
}
export async function releaseReport(
  db: DB,
  id: string,
  lease: string,
  delay: number,
): Promise<void> {
  const { error } = await db
    .from("comparison_reports")
    .update({
      lease_token: null,
      lease_until: null,
      next_attempt_at: new Date(Date.now() + delay * 1000).toISOString(),
    })
    .eq("id", id)
    .eq("lease_token", lease);
  if (error) throw error;
}
export async function nextReportAttempt(db: DB): Promise<string | null> {
  const { data, error } = await db
    .from("comparison_reports")
    .select("next_attempt_at,lease_until")
    .in("status", ["queued", "starting", "generating", "downloading"]);
  if (error) throw error;
  if (!data.length) return null;
  return new Date(
    Math.min(
      ...data.map((row) =>
        Math.max(
          Date.parse(row.next_attempt_at),
          row.lease_until ? Date.parse(row.lease_until) : 0,
        ),
      ),
    ),
  ).toISOString();
}
export async function wakeReportWorker(): Promise<boolean> {
  const { spawn } = await import("node:child_process");
  const { resolve } = await import("node:path");
  return new Promise((started) => {
    const child = spawn(
      process.execPath,
      [resolve("scripts/report-worker.mjs")],
      { detached: true, stdio: "ignore", env: process.env },
    );
    child.once("error", () => started(false));
    child.once("spawn", () => {
      child.unref();
      started(true);
    });
  });
}
export async function cancelReport(db: DB, id: string): Promise<boolean> {
  const { data, error } = await db.rpc("cancel_comparison_report", {
    p_report: id,
  });
  if (error) throw error;
  return data;
}
export async function recordCancelledGeneration(
  db: DB,
  id: string,
  organizationId: string,
  generationId: string,
): Promise<void> {
  const { error } = await db
    .from("comparison_reports")
    .update({ provider_generation_id: generationId })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .eq("status", "cancelled")
    .is("provider_generation_id", null);
  if (error) throw error;
}
