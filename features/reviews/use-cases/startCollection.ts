import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { getProperty } from "@/features/properties/queries/getProperty";
import { getAnalysis } from "@/features/analyses/queries/getAnalysis";
import {
  enqueueCollection,
  wakeCollectionWorker,
  enqueuePropertyCollection,
} from "../repositories/collections";
import type { StartCollectionInput } from "../schemas/startCollectionInput";
import type { StartCollectionOutput } from "../schemas/startCollectionOutput";
export async function startCollection(
  ctx: OperationContext,
  input: StartCollectionInput,
): Promise<StartCollectionOutput> {
  const entity = input.propertyId
    ? await getProperty({ id: input.propertyId })
    : await getAnalysis({ id: input.analysisId });
  if (!entity) throw new Error("SCOPE_NOT_FOUND");
  if (input.propertyId) {
    if (!process.env.APIFY_TOKEN)
      return { ok: false, code: "APIFY_NOT_CONFIGURED" };
    if (
      !process.env.COLLECTION_WORKER_SECRET ||
      process.env.COLLECTION_WORKER_SECRET.length < 32
    )
      return { ok: false, code: "WORKER_NOT_CONFIGURED" };
  }
  try {
    const runId = input.propertyId
      ? await enqueuePropertyCollection(
          ctx.db,
          input.propertyId,
          input.maxReviews,
          input.period.start,
          input.period.end,
        )
      : await enqueueCollection(ctx.db, entity.id, input.maxReviews);
    if (input.propertyId) {
      const awake = await wakeCollectionWorker();
      if (!awake) return { ok: false, code: "WORKER_UNAVAILABLE" };
    }
    return { ok: true, runId };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      (error.message === "PROPERTIES_NOT_COLLECTED" ||
        error.message === "COMPARISON_COVERAGE_INCOMPLETE")
    )
      return {
        ok: false,
        code: error.message as
          "PROPERTIES_NOT_COLLECTED" | "COMPARISON_COVERAGE_INCOMPLETE",
      };
    return { ok: false, code: "COLLECTION_FAILED" };
  }
}
