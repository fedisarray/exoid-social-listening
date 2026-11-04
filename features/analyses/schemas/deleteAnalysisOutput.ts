import { z } from "zod";

export const deleteAnalysisOutputSchema = z.object({ ok: z.boolean() });
export type DeleteAnalysisOutput = z.infer<typeof deleteAnalysisOutputSchema>;
