import { z } from "zod";
export const getAnalysisInputSchema = z.object({ id: z.uuid() });
