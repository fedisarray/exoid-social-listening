import { z } from "zod";
export const signInOutputSchema = z.object({ ok: z.boolean() });
