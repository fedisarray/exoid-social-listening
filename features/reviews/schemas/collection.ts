import { z } from "zod";
export const sourceStatusSchema = z.enum([
  "queued",
  "starting",
  "running",
  "importing",
  "completed",
  "partial",
  "failed",
]);
export const sourceProgressSchema = z.object({
  id: z.uuid(),
  listingId: z.string(),
  label: z.string(),
  role: z.string(),
  status: sourceStatusSchema,
  returned: z.number(),
  accepted: z.number(),
  skipped: z.number(),
  missingIds: z.number(),
  missingReviewers: z.number(),
  duplicates: z.number(),
  earliest: z.string().nullable(),
  latest: z.string().nullable(),
  capped: z.boolean(),
  error: z.string().nullable(),
  providerBuildId: z.string().nullable(),
  cost: z.number().nullable(),
});
export const collectionSchema = z.object({
  id: z.uuid(),
  version: z.number(),
  status: z.enum(["queued", "running", "completed", "partial", "failed"]),
  createdAt: z.string(),
  finishedAt: z.string().nullable(),
  maxReviews: z.number(),
  sources: z.array(sourceProgressSchema),
});
export type Collection = z.infer<typeof collectionSchema>;
export const snapshotSchema = z.object({
  id: z.uuid(),
  version: z.number(),
  createdAt: z.string(),
  start: z.iso.date(),
  end: z.iso.date(),
});
export type Snapshot = z.infer<typeof snapshotSchema>;
