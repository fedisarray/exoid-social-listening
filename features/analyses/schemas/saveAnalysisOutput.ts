import { z } from "zod";
import { analysisDetailSchema } from "./analysisDetail";
export const saveAnalysisOutputSchema = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), analysis: analysisDetailSchema }),
  z.object({
    ok: z.literal(false),
    code: z.enum(["CONFLICT", "UNCONFIRMED_LISTING", "SAVE_FAILED"]),
  }),
]);
export type SaveAnalysisOutput = z.infer<typeof saveAnalysisOutputSchema>;
