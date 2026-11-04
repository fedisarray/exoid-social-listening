import { z } from "zod";
import { organizationRoleSchema } from "./organizationRole";
export const listOrganizationMembersOutputSchema = z.array(
  z.object({
    userId: z.uuid(),
    role: organizationRoleSchema,
    joinedAt: z.iso.datetime({ offset: true }),
  }),
);
export type ListOrganizationMembersOutput = z.infer<
  typeof listOrganizationMembersOutputSchema
>;
