import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { getAnalysis } from "@/features/analyses/queries/getAnalysis";
import { enqueueCollection } from "../repositories/collections";
import type { StartCollectionInput } from "../schemas/startCollectionInput";
import type { StartCollectionOutput } from "../schemas/startCollectionOutput";
export async function startCollection(
  ctx: OperationContext,
  input: StartCollectionInput,
): Promise<StartCollectionOutput> {
  const analysis = await getAnalysis({ id: input.analysisId });
  if (!analysis) throw new Error("ANALYSIS_NOT_FOUND");
  if (!process.env.APIFY_TOKEN)
    return { ok: false, code: "APIFY_NOT_CONFIGURED" };
  if (
    !process.env.COLLECTION_WORKER_SECRET ||
    process.env.COLLECTION_WORKER_SECRET.length < 32
  )
    return { ok: false, code: "WORKER_NOT_CONFIGURED" };
  try {
    const runId = await enqueueCollection(
      ctx.db,
      input.analysisId,
      input.maxReviews,
    );
    return { ok: true, runId };
  } catch {
    return { ok: false, code: "COLLECTION_FAILED" };
  }
}
