"use server";
import { requireUser } from "@/lib/auth/dal";
import { getSharedReviewerEvidenceInputSchema } from "../schemas/getSharedReviewerEvidenceInput";
import {
  getSharedReviewerEvidenceOutputSchema,
  type SharedReviewerEvidence,
} from "../schemas/getSharedReviewerEvidenceOutput";
import { getSharedReviewerEvidence as execute } from "../use-cases/getSharedReviewerEvidence";

export async function getSharedReviewerEvidence(
  raw: unknown,
): Promise<SharedReviewerEvidence> {
  const input = getSharedReviewerEvidenceInputSchema.parse(raw);
  const ctx = await requireUser();
  const output = await execute(ctx, input);
  return getSharedReviewerEvidenceOutputSchema.parse(output);
}
