import { z } from "zod";
import { collectionSchema, snapshotSchema } from "./collection";
export const metricFactsSchema = z.object({
  reviews: z.number(),
  ratedCount: z.number(),
  rating: z.number().nullable(),
  satisfaction: z.number().nullable(),
  textReviews: z.number(),
  identifiedReviews: z.number(),
  identifiedReviewers: z.number(),
});
const propertySchema = metricFactsSchema.extend({
  listingId: z.string(),
  status: z.string(),
  available: z.boolean(),
  label: z.string(),
  role: z.string(),
});
const bucketSchema = metricFactsSchema.extend({
  listingId: z.string(),
  bucket: z.string(),
});
export const rawMetricsSchema = z.object({
  properties: z.array(
    metricFactsSchema.extend({
      listingId: z.string(),
      status: z.string(),
      available: z.boolean(),
    }),
  ),
  monthly: z.array(bucketSchema),
  annual: z.array(bucketSchema),
  quarters: z.array(bucketSchema),
  rolling: z.array(metricFactsSchema.extend({ listingId: z.string() })),
  rollingStart: z.iso.date(),
  rollingEnd: z.iso.date(),
  shared: z.array(
    z.object({
      listingId: z.string(),
      primaryReviewers: z.number(),
      competitorReviewers: z.number(),
      shared: z.number().nullable(),
      primaryShare: z.number().nullable(),
      competitorShare: z.number().nullable(),
      primaryRating: z.number().nullable(),
      competitorRating: z.number().nullable(),
    }),
  ),
  samples: z.array(
    z.object({
      listingId: z.string(),
      rating: z.number().nullable(),
      publishedAt: z.string(),
      text: z.string(),
      language: z.string().nullable(),
      url: z.string().nullable(),
    }),
  ),
});
export const metricsSchema = rawMetricsSchema.extend({
  properties: z.array(propertySchema),
});
export const getReviewDashboardOutputSchema = z.object({
  run: collectionSchema.nullable(),
  snapshots: z.array(snapshotSchema),
  snapshot: snapshotSchema.nullable(),
  metrics: metricsSchema.nullable(),
  workerStalled: z.boolean(),
});
export type ReviewDashboard = z.infer<typeof getReviewDashboardOutputSchema>;
export type MetricFacts = z.infer<typeof metricFactsSchema>;
