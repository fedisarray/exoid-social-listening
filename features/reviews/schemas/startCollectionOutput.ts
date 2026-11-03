import { z } from "zod";
export const startCollectionOutputSchema = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), runId: z.uuid() }),
  z.object({
    ok: z.literal(false),
    code: z.enum([
      "APIFY_NOT_CONFIGURED",
      "WORKER_NOT_CONFIGURED",
      "COLLECTION_FAILED",
    ]),
  }),
]);
export type StartCollectionOutput = z.infer<typeof startCollectionOutputSchema>;
