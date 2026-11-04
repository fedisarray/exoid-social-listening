import { z } from "zod";
export const getPropertyInputSchema = z.object({ id: z.uuid() });
