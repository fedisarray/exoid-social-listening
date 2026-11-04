import "server-only";
import { z } from "zod";
import {
  storedCoverageSchema,
  type StoredCoverage,
} from "../schemas/reviewCoverage";
import type { EnsureComparisonCoverageInput } from "../schemas/ensureComparisonCoverageInput";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Tables,
  TablesUpdate,
} from "@/lib/supabase/database.types";
import type { Collection, Snapshot } from "../schemas/collection";
import type { NormalizedReview } from "../domain/normalizeReviews";
import type { GetReviewDashboardInput } from "../schemas/getReviewDashboardInput";
import { rawMetricsSchema } from "../schemas/getReviewDashboardOutput";
import type { GetSharedReviewerEvidenceInput } from "../schemas/getSharedReviewerEvidenceInput";
import {
  getSharedReviewerEvidenceOutputSchema,
  type SharedReviewerEvidence,
} from "../schemas/getSharedReviewerEvidenceOutput";
type DB = SupabaseClient<Database>;
export async function enqueueCollection(
  db: DB,
  analysisId: string,
  maxReviews: number,
): Promise<string> {
  const { data, error } = await db.rpc("queue_review_collection", {
    p_analysis_id: analysisId,
    p_max_reviews: maxReviews,
  });
  if (error) throw error;
  return data;
}
export async function latestCollection(
  db: DB,
  scope: { analysisId?: string; propertyId?: string },
  snapshotId?: string,
): Promise<Collection | null> {
  let runQuery = db.from("review_collection_runs").select("*");
  if (snapshotId) {
    const snapshot = await db
      .from("review_snapshots")
      .select("run_id")
      .eq("id", snapshotId)
      .eq(
        scope.propertyId ? "property_id" : "analysis_id",
        (scope.propertyId ?? scope.analysisId)!,
      )
      .maybeSingle();
    if (snapshot.error) throw snapshot.error;
    if (!snapshot.data) return null;
    runQuery = runQuery.eq("id", snapshot.data.run_id);
  }
  const { data, error } = await runQuery
    .eq(
      scope.propertyId ? "property_id" : "analysis_id",
      scope.propertyId ?? scope.analysisId!,
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const sources = await collectionSources(db, data.id);
  return {
    id: data.id,
    version: data.analysis_version,
    status: data.status as Collection["status"],
    createdAt: data.created_at,
    finishedAt: data.finished_at,
    maxReviews: data.max_reviews,
    sources: sources.map((s) => ({
      id: s.id,
      listingId: s.listing_id,
      label: s.label,
      role: s.role,
      status: s.status as Collection["sources"][number]["status"],
      returned: s.returned_count,
      accepted: s.accepted_count,
      skipped: s.skipped_count,
      missingIds: s.missing_id_count,
      missingReviewers: s.missing_reviewer_count,
      duplicates: s.duplicate_count,
      earliest: s.earliest_at,
      latest: s.latest_at,
      capped: s.capped,
      error: s.error,
      providerBuildId: s.provider_build_id,
      cost: s.provider_cost,
    })),
  };
}
export async function collectionSources(
  db: DB,
  runId: string,
): Promise<Tables<"review_collection_sources">[]> {
  const { data, error } = await db
    .from("review_collection_sources")
    .select("*")
    .eq("run_id", runId)
    .order("ordinal");
  if (error) throw error;
  return data;
}
export async function listSnapshots(
  db: DB,
  scope: { analysisId?: string; propertyId?: string },
): Promise<Snapshot[]> {
  const { data, error } = await db
    .from("review_snapshots")
    .select("*")
    .eq(
      scope.propertyId ? "property_id" : "analysis_id",
      scope.propertyId ?? scope.analysisId!,
    )
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data.map((s) => ({
    id: s.id,
    version: s.analysis_version,
    createdAt: s.created_at,
    start: s.requested_start,
    end: s.requested_end,
  }));
}
export async function snapshotSources(
  db: DB,
  snapshotId: string,
): Promise<Tables<"review_collection_sources">[]> {
  const { data, error } = await db
    .from("review_snapshots")
    .select("run_id")
    .eq("id", snapshotId)
    .single();
  if (error) throw error;
  return collectionSources(db, data.run_id);
}
export async function readMetrics(
  db: DB,
  snapshotId: string,
  input: GetReviewDashboardInput,
): Promise<ReturnType<typeof rawMetricsSchema.parse>> {
  const { data, error } = await db.rpc("get_review_dashboard_metrics", {
    p_snapshot: snapshotId,
    p_start: input.period.start,
    p_end: input.period.end,
    p_kind: input.period.kind,
    p_quarter: input.period.quarter,
    p_year: input.period.year,
  });
  if (error) throw error;
  return rawMetricsSchema.parse(data);
}
export async function claimCollection(
  db: DB,
): Promise<Tables<"review_collection_runs"> | null> {
  const { data, error } = await db.rpc("claim_review_collection");
  if (error) throw error;
  return data[0] ?? null;
}
export async function updateSource(
  db: DB,
  id: string,
  changes: TablesUpdate<"review_collection_sources">,
): Promise<void> {
  const { error } = await db
    .from("review_collection_sources")
    .update(changes)
    .eq("id", id);
  if (error) throw error;
}
export async function ingestPage(
  db: DB,
  sourceId: string,
  lease: string,
  offset: number,
  consumed: number,
  result: { reviews: NormalizedReview[]; skipped: number; missingIds: number },
): Promise<void> {
  const { error } = await db.rpc("ingest_review_page", {
    p_source_id: sourceId,
    p_lease: lease,
    p_offset: offset,
    p_consumed: consumed,
    p_reviews: result.reviews,
    p_skipped: result.skipped,
    p_missing_ids: result.missingIds,
  });
  if (error) throw error;
}
export async function finishCollection(
  db: DB,
  id: string,
  lease: string,
): Promise<void> {
  const { error } = await db.rpc("finish_review_collection", {
    p_run_id: id,
    p_lease: lease,
  });
  if (error) throw error;
}
export async function releaseCollection(
  db: DB,
  id: string,
  lease: string,
  delaySeconds: number,
): Promise<void> {
  const { error } = await db
    .from("review_collection_runs")
    .update({
      lease_until: null,
      lease_token: null,
      next_attempt_at: new Date(Date.now() + delaySeconds * 1000).toISOString(),
    })
    .eq("id", id)
    .eq("lease_token", lease);
  if (error) throw error;
}

export async function enqueuePropertyCollection(
  db: DB,
  propertyId: string,
  maxReviews: number,
  start: string,
  end: string,
): Promise<string> {
  const { data, error } = await db.rpc("queue_property_collection", {
    p_property_id: propertyId,
    p_max_reviews: maxReviews,
    p_start: start,
    p_end: end,
  });
  if (error) throw error;
  return data;
}

export async function readStoredDashboard(
  db: DB,
  input: GetReviewDashboardInput,
): Promise<{
  coverage: StoredCoverage[];
  metrics: ReturnType<typeof rawMetricsSchema.parse>;
}> {
  const { data, error } = await db.rpc("get_stored_review_dashboard", {
    p_scope: (input.propertyId ?? input.analysisId)!,
    p_property: Boolean(input.propertyId),
    p_start: input.period.start,
    p_end: input.period.end,
    p_kind: input.period.kind,
    p_quarter: input.period.quarter,
    p_year: input.period.year,
  });
  if (error) throw error;
  return z
    .object({
      coverage: z.array(storedCoverageSchema),
      metrics: rawMetricsSchema,
    })
    .parse(data);
}
export async function readFrozenCoverage(
  db: DB,
  snapshotId: string,
): Promise<StoredCoverage[]> {
  const { data, error } = await db.rpc("get_frozen_review_coverage", {
    p_snapshot: snapshotId,
  });
  if (error) throw error;
  return z.array(storedCoverageSchema).parse(data);
}
export async function ensureCoverage(
  db: DB,
  input: EnsureComparisonCoverageInput,
): Promise<void> {
  const { error } = await db.rpc("ensure_comparison_coverage", {
    p_analysis: input.analysisId,
    p_start: input.period.start,
    p_end: input.period.end,
    p_retry: input.retry,
  });
  if (error) throw error;
}
export async function findSnapshot(
  db: DB,
  scope: { propertyId?: string; analysisId?: string },
  id: string,
): Promise<Snapshot> {
  const { data, error } = await db
    .from("review_snapshots")
    .select("*")
    .eq(
      scope.propertyId ? "property_id" : "analysis_id",
      (scope.propertyId ?? scope.analysisId)!,
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return {
    id: data.id,
    version: data.analysis_version,
    createdAt: data.created_at,
    start: data.requested_start,
    end: data.requested_end,
  };
}

export async function findRunSnapshot(
  db: DB,
  analysisId: string,
  runId: string,
): Promise<string> {
  const { data, error } = await db
    .from("review_snapshots")
    .select("id")
    .eq("analysis_id", analysisId)
    .eq("run_id", runId)
    .single();
  if (error) throw error;
  return data.id;
}

export async function nextCollectionAttempt(db: DB): Promise<string | null> {
  const { data, error } = await db
    .from("review_collection_runs")
    .select("next_attempt_at,lease_until")
    .in("status", ["queued", "running"]);
  if (error) throw error;
  if (!data.length) return null;
  const next = Math.min(
    ...data.map((run) =>
      Math.max(
        Date.parse(run.next_attempt_at),
        run.lease_until ? Date.parse(run.lease_until) : 0,
      ),
    ),
  );
  return new Date(next).toISOString();
}

export async function wakeCollectionWorker(): Promise<boolean> {
  const { spawn } = await import("node:child_process");
  const { resolve } = await import("node:path");
  return new Promise((resolveStarted) => {
    const child = spawn(
      process.execPath,
      [resolve("scripts/collection-worker.mjs")],
      {
        detached: true,
        stdio: "ignore",
        env: process.env,
      },
    );
    child.once("error", () => resolveStarted(false));
    child.once("spawn", () => {
      child.unref();
      resolveStarted(true);
    });
  });
}

export async function readSharedReviewerEvidence(
  db: DB,
  input: GetSharedReviewerEvidenceInput,
): Promise<SharedReviewerEvidence> {
  const { data, error } = await db.rpc("get_shared_reviewer_evidence", {
    p_analysis: input.analysisId,
    p_snapshot: input.snapshotId,
    p_competitor: input.competitorId,
    p_start: input.period.start,
    p_end: input.period.end,
    p_offset: input.offset,
  });
  if (error) throw error;
  const evidence = getSharedReviewerEvidenceOutputSchema
    .omit({ available: true })
    .parse(data);
  return { ...evidence, available: true };
}
