"use server";
import { requireUser } from "@/lib/auth/dal";
import { updateOrganizationInputSchema } from "../schemas/updateOrganizationInput";
import {
  organizationMutationOutputSchema,
  type OrganizationMutationOutput,
} from "../schemas/organizationMutationOutput";
import { updateOrganization as execute } from "../use-cases/updateOrganization";
export async function updateOrganization(
  raw: unknown,
): Promise<OrganizationMutationOutput> {
  const input = updateOrganizationInputSchema.parse(raw);
  const ctx = await requireUser();
  const result = await execute(ctx, input);
  return organizationMutationOutputSchema.parse(result);
}
