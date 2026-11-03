import { z } from "zod";
export const verifyLoginCodeOutputSchema = z.object({ ok: z.boolean() });
export type VerifyLoginCodeOutput = z.infer<typeof verifyLoginCodeOutputSchema>;
