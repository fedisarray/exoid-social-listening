import { z } from "zod";
export const ensureComparisonCoverageOutputSchema = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true) }),
  z.object({
    ok: z.literal(false),
    code: z.enum([
      "APIFY_NOT_CONFIGURED",
      "WORKER_NOT_CONFIGURED",
      "WORKER_UNAVAILABLE",
    ]),
  }),
]);
export type EnsureComparisonCoverageOutput = z.infer<
  typeof ensureComparisonCoverageOutputSchema
>;
