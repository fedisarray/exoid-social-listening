import { z } from "zod";
export const deletePropertyOutputSchema = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true) }),
  z.object({ ok: z.literal(false), code: z.literal("PROPERTY_NOT_FOUND") }),
]);
export type DeletePropertyOutput = z.infer<typeof deletePropertyOutputSchema>;
