import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { getReviewDashboard } from "./getReviewDashboard";
import { readSharedReviewerEvidence } from "../repositories/collections";
import type { GetSharedReviewerEvidenceInput } from "../schemas/getSharedReviewerEvidenceInput";
import type { SharedReviewerEvidence } from "../schemas/getSharedReviewerEvidenceOutput";

export async function getSharedReviewerEvidence(
  ctx: OperationContext,
  input: GetSharedReviewerEvidenceInput,
): Promise<SharedReviewerEvidence> {
  const dashboard = await getReviewDashboard(ctx, input);
  if (!dashboard.comparisonReady)
    return { available: false, total: 0, reviewers: [] };
  if (
    !dashboard.metrics?.shared.some(
      (row) => row.listingId === input.competitorId,
    )
  ) {
    throw new Error("COMPARISON_PLACE_NOT_FOUND");
  }
  const evidence = await readSharedReviewerEvidence(ctx.db, input);
  return evidence;
}
