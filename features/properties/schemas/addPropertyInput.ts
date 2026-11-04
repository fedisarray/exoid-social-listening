import { z } from "zod";
export const addPropertyInputSchema = z.object({ sourceId: z.string().min(1) });
