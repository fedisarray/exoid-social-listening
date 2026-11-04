import { z } from "zod";

export const deleteAnalysisInputSchema = z.object({ id: z.uuid() });
export type DeleteAnalysisInput = z.infer<typeof deleteAnalysisInputSchema>;
