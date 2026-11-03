import { z } from "zod";
export const requestLoginCodeInputSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
});
export type RequestLoginCodeInput = z.infer<typeof requestLoginCodeInputSchema>;
