import { z } from "zod";
import { organizationRoleSchema } from "./organizationRole";
export const getOrganizationOutputSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  reportTemplateId: z.string().nullable(),
  role: organizationRoleSchema,
});
export type GetOrganizationOutput = z.infer<typeof getOrganizationOutputSchema>;
