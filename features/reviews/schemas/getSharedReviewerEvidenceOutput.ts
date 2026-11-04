import { z } from "zod";

const evidenceReviewSchema = z.object({
  rating: z.number().min(1).max(5).nullable(),
  publishedAt: z.iso.datetime({ offset: true }),
  text: z.string(),
  language: z.string().nullable(),
  url: z.string().nullable(),
});
export const getSharedReviewerEvidenceOutputSchema = z.object({
  available: z.boolean(),
  total: z.number().int().nonnegative(),
  reviewers: z
    .array(
      z.object({
        reviewerId: z.string(),
        primaryReview: evidenceReviewSchema,
        competitorReview: evidenceReviewSchema,
      }),
    )
    .max(20),
});
export type SharedReviewerEvidence = z.infer<
  typeof getSharedReviewerEvidenceOutputSchema
>;
