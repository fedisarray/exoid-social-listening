import { z } from "zod";
export const changeOrganizationMemberRoleInputSchema = z
  .object({ userId: z.uuid(), role: z.enum(["admin", "member"]) })
  .strict();
export type ChangeOrganizationMemberRoleInput = z.infer<
  typeof changeOrganizationMemberRoleInputSchema
>;
