import { z } from "zod";
export const deletePropertyInputSchema = z.object({ id: z.uuid() });
