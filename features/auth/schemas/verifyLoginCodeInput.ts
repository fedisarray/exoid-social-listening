import { z } from "zod";
import { requestLoginCodeInputSchema } from "./requestLoginCodeInput";
export const verifyLoginCodeInputSchema = requestLoginCodeInputSchema.extend({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
});
export type VerifyLoginCodeInput = z.infer<typeof verifyLoginCodeInputSchema>;
