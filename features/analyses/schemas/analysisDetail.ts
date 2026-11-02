import { z } from "zod";
import { analysisConfigSchema } from "./analysisConfig";
export const analysisDetailSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  version: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  config: analysisConfigSchema,
});
export const analysisSummarySchema = analysisDetailSchema.omit({
  config: true,
});
export type AnalysisDetail = z.infer<typeof analysisDetailSchema>;
export type AnalysisSummary = z.infer<typeof analysisSummarySchema>;
