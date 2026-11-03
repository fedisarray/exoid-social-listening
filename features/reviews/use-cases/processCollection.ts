import "server-only";
import type { CollectionWorkerContext } from "@/lib/auth/dal";
import {
  claimCollection,
  collectionSources,
  updateSource,
  ingestPage,
  finishCollection,
  releaseCollection,
} from "../repositories/collections";
import {
  startReviewActor,
  readReviewActor,
  readReviewPage,
} from "../repositories/apify";
import { normalizeReviews } from "../domain/normalizeReviews";
export async function processCollection(
  ctx: CollectionWorkerContext,
): Promise<{ worked: boolean }> {
  const run = await claimCollection(ctx.db);
  if (!run) return { worked: false };
  const lease = run.lease_token;
  if (!lease) throw new Error("LEASE_MISSING");
  let delay = 3;
  try {
    const sources = await collectionSources(ctx.db, run.id);
    const source = sources.find(
      (s) => !["completed", "partial", "failed"].includes(s.status),
    );
    if (!source) {
      await finishCollection(ctx.db, run.id, lease);
      return { worked: true };
    }
    try {
      if (source.status === "queued") {
        await updateSource(ctx.db, source.id, { status: "starting" });
        try {
          const id = await startReviewActor(
            source.listing_url,
            run.requested_start,
            run.max_reviews,
          );
          await updateSource(ctx.db, source.id, {
            status: "running",
            provider_run_id: id,
            attempts: 0,
            error: null,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          const known = [
            "APIFY_NOT_CONFIGURED",
            "APIFY_ACCESS_DENIED",
            "INVALID_LISTING_URL",
          ].includes(message);
          await updateSource(ctx.db, source.id, {
            status: "failed",
            error: known ? message : "PROVIDER_START_UNCERTAIN",
          });
        }
      } else if (source.status === "starting") {
        // A crash between provider start and recording its ID must never launch a second paid run automatically.
        await updateSource(ctx.db, source.id, {
          status: "failed",
          error: "PROVIDER_START_UNCERTAIN",
        });
      } else if (source.status === "running") {
        if (!source.provider_run_id) throw new Error("PROVIDER_RUN_MISSING");
        const remote = await readReviewActor(source.provider_run_id);
        if (
          ["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"].includes(
            remote.status,
          )
        ) {
          if (!remote.datasetId || remote.total === null) {
            await updateSource(ctx.db, source.id, {
              status: "failed",
              error: "PROVIDER_DATASET_MISSING",
            });
          } else if (remote.status !== "SUCCEEDED" && remote.total === 0) {
            await updateSource(ctx.db, source.id, {
              status: "failed",
              provider_status: remote.status,
              error: "PROVIDER_RUN_FAILED",
            });
          } else
            await updateSource(ctx.db, source.id, {
              status: "importing",
              dataset_id: remote.datasetId,
              dataset_total: remote.total,
              provider_status: remote.status,
              provider_build_id: remote.buildId,
              provider_cost: remote.cost,
              capped: remote.total >= run.max_reviews,
              attempts: 0,
              error: null,
            });
        } else
          await updateSource(ctx.db, source.id, {
            provider_status: remote.status,
            attempts: 0,
            error: null,
          });
      } else if (source.status === "importing") {
        if (!source.dataset_id || source.dataset_total === null)
          throw new Error("PROVIDER_DATASET_MISSING");
        if (source.next_offset >= source.dataset_total) {
          const partial =
            source.capped ||
            source.skipped_count > 0 ||
            source.provider_status !== "SUCCEEDED";
          await updateSource(ctx.db, source.id, {
            status: partial ? "partial" : "completed",
            error:
              source.provider_status !== "SUCCEEDED"
                ? "PROVIDER_RUN_PARTIAL"
                : null,
          });
        } else {
          const remaining = source.dataset_total - source.next_offset;
          const rows = await readReviewPage(
            source.dataset_id,
            source.next_offset,
            Math.min(250, remaining),
          );
          if (!rows.length) throw new Error("PROVIDER_PAGE_MISSING");
          const normalized = normalizeReviews(rows, source.listing_id);
          await ingestPage(
            ctx.db,
            source.id,
            lease,
            source.next_offset,
            rows.length,
            normalized,
          );
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const code = /^[A-Z_]+$/.test(message)
        ? message
        : "COLLECTION_PROCESSING_FAILED";
      const attempts = source.attempts + 1;
      await updateSource(ctx.db, source.id, {
        attempts,
        error: code,
        ...(attempts >= 3
          ? { status: source.accepted_count > 0 ? "partial" : "failed" }
          : {}),
      });
      delay = Math.min(30, attempts * 5);
    }
  } finally {
    await releaseCollection(ctx.db, run.id, lease, delay);
  }
  return { worked: true };
}
