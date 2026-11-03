import "server-only";
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
  analysisId: string,
): Promise<Collection | null> {
  const { data, error } = await db
    .from("review_collection_runs")
    .select("*")
    .eq("analysis_id", analysisId)
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
  analysisId: string,
): Promise<Snapshot[]> {
  const { data, error } = await db
    .from("review_snapshots")
    .select("*")
    .eq("analysis_id", analysisId)
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
