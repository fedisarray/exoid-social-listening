import { z } from "zod";
export const addOrganizationMemberInputSchema = z
  .object({ userId: z.uuid(), role: z.enum(["admin", "member"]) })
  .strict();
export type AddOrganizationMemberInput = z.infer<
  typeof addOrganizationMemberInputSchema
>;
