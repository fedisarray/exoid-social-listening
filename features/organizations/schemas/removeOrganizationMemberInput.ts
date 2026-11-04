import { z } from "zod";
export const removeOrganizationMemberInputSchema = z
  .object({ userId: z.uuid() })
  .strict();
export type RemoveOrganizationMemberInput = z.infer<
  typeof removeOrganizationMemberInputSchema
>;
