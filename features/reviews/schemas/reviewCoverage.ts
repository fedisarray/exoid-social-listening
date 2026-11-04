import { z } from "zod";
export const dateIntervalSchema = z.object({
  start: z.iso.date(),
  end: z.iso.date(),
});
export const storedCoverageSchema = z.object({
  propertyId: z.uuid().nullable(),
  listingId: z.string(),
  label: z.string(),
  role: z.string(),
  covered: z.array(dateIntervalSchema),
  sourceSnapshotIds: z.array(z.uuid()),
  activeRun: z
    .object({
      id: z.uuid(),
      status: z.enum(["queued", "running"]),
      createdAt: z.string(),
    })
    .nullable(),
  collections: z.array(
    z.object({
      id: z.uuid(),
      start: z.iso.date(),
      end: z.iso.date(),
      collectedAt: z.string().nullable(),
      status: z.string(),
      earliest: z.string().nullable(),
      latest: z.string().nullable(),
      capped: z.boolean(),
      skipped: z.number(),
      error: z.string().nullable(),
      providerStart: z.iso.date(),
      providerEnd: z.iso.date().nullable(),
    }),
  ),
});
export const reviewCoverageSchema = storedCoverageSchema.extend({
  missing: z.array(dateIntervalSchema),
  ready: z.boolean(),
  reason: z.enum([
    "covered",
    "collecting",
    "notCollected",
    "incomplete",
    "future",
    "placeRemoved",
  ]),
});
export type DateInterval = z.infer<typeof dateIntervalSchema>;
export type StoredCoverage = z.infer<typeof storedCoverageSchema>;
export type ReviewCoverage = z.infer<typeof reviewCoverageSchema>;
