import { z } from "zod";
export const requestLoginCodeOutputSchema = z.object({ ok: z.boolean() });
export type RequestLoginCodeOutput = z.infer<
  typeof requestLoginCodeOutputSchema
>;
