import { z } from "zod";

export const importSummarySchema = z.object({
  id: z.string().uuid(),
  sourceLabel: z.string(),
  kind: z.enum(["review_rows", "aggregate_only"]),
  rowCount: z.number().int(),
  createdAt: z.iso.datetime({ offset: true }),
});

export const visualizationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("sentiment"),
    data: z.array(
      z.object({
        name: z.string(),
        count: z.number().int(),
        filterKind: z.string(),
        filterValue: z.string(),
      }),
    ),
  }),
  z.object({
    type: z.literal("themes"),
    data: z.array(
      z.object({
        name: z.string(),
        positive: z.number().int(),
        negative: z.number().int(),
        mixed: z.number().int(),
        unclassified: z.number().int(),
        filterKind: z.string(),
        filterValue: z.string(),
      }),
    ),
  }),
  z.object({
    type: z.enum(["sentiment_trend", "area"]),
    data: z.array(
      z.object({
        month: z.string(),
        positive: z.number().int(),
        negative: z.number().int(),
        mixed: z.number().int(),
        unclassified: z.number().int(),
        filterKind: z.string(),
        filterValue: z.string(),
      }),
    ),
  }),
  z.object({
    type: z.enum(["listing_comparison", "radar"]),
    data: z.array(
      z.object({
        name: z.string(),
        positive: z.number().int(),
        negative: z.number().int(),
        mixed: z.number().int(),
        unclassified: z.number().int(),
        filterKind: z.string(),
        filterValue: z.string(),
      }),
    ),
  }),
  z.object({
    type: z.literal("word_cloud"),
    data: z.array(
      z.object({
        text: z.string(),
        value: z.number().int(),
        filterKind: z.string(),
        filterValue: z.string(),
      }),
    ),
  }),
]);
export type Visualization = z.infer<typeof visualizationSchema>;

export const chatMessageSchema = z.object({
  id: z.string().uuid(),
  importId: z.string().uuid(),
  role: z.enum(["user", "assistant"]),
  locale: z.enum(["it", "en"]),
  content: z.string(),
  citations: z.array(
    z.object({
      reviewId: z.string().uuid(),
      quote: z.string(),
      sheet: z.string(),
      row: z.number().int(),
    }),
  ),
  visualization: visualizationSchema.nullable(),
  periodStart: z.iso.date(),
  periodEnd: z.iso.date(),
  createdAt: z.iso.datetime({ offset: true }),
  job: z
    .object({
      id: z.string().uuid(),
      status: z.enum(["queued", "running", "completed", "failed"]),
      processed: z.number().int(),
      total: z.number().int(),
    })
    .nullable(),
});

export const comparisonAiWorkspaceSchema = z.object({
  imports: z.array(importSummarySchema),
  messages: z.array(chatMessageSchema),
});
export type ComparisonAiWorkspace = z.infer<typeof comparisonAiWorkspaceSchema>;
