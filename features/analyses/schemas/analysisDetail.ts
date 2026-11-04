import { z } from "zod";
import { periodSchema } from "@/features/_shared/schemas/period";
import { selectionSchema } from "./analysisConfig";
import { analysisConfigSchema } from "./analysisConfig";
export const analysisDetailSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  version: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  config: analysisConfigSchema,
});
export const analysisSummarySchema = analysisDetailSchema
  .omit({ config: true })
  .extend({
    primary: selectionSchema,
    period: periodSchema,
    propertyCount: z.number().int().positive(),
  });
export type AnalysisDetail = z.infer<typeof analysisDetailSchema>;
export type AnalysisSummary = z.infer<typeof analysisSummarySchema>;
