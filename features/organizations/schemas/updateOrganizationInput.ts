import { z } from "zod";
export const updateOrganizationInputSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    reportTemplateId: z.string().trim().min(1).max(128).nullable(),
  })
  .strict();
export type UpdateOrganizationInput = z.infer<
  typeof updateOrganizationInputSchema
>;
