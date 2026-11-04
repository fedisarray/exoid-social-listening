import { z } from "zod";
export const organizationErrorCodeSchema = z.enum([
  "FORBIDDEN",
  "MEMBER_NOT_FOUND",
  "USER_UNAVAILABLE",
  "INVALID_SETTINGS",
]);
export const organizationMutationOutputSchema = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true) }),
  z.object({ ok: z.literal(false), code: organizationErrorCodeSchema }),
]);
export type OrganizationMutationOutput = z.infer<
  typeof organizationMutationOutputSchema
>;
