import { z } from "zod";
import { organizationRoleSchema } from "./organizationRole";
export const organizationMembershipSchema = z.object({
  organizationId: z.uuid(),
  role: organizationRoleSchema,
});
export type OrganizationMembership = z.infer<
  typeof organizationMembershipSchema
>;
