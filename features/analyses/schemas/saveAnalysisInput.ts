import { z } from "zod";
import { analysisConfigSchema } from "./analysisConfig";
export const saveAnalysisInputSchema = z.object({
  id: z.uuid().nullable(),
  expectedVersion: z.number().int().nonnegative(),
  name: z.string().trim().min(1).max(120),
  config: analysisConfigSchema,
});
export type SaveAnalysisInput = z.infer<typeof saveAnalysisInputSchema>;
