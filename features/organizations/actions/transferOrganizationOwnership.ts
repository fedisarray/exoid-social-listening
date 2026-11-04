"use server";
import { requireUser } from "@/lib/auth/dal";
import { transferOrganizationOwnershipInputSchema } from "../schemas/transferOrganizationOwnershipInput";
import {
  organizationMutationOutputSchema,
  type OrganizationMutationOutput,
} from "../schemas/organizationMutationOutput";
import { transferOrganizationOwnership as execute } from "../use-cases/transferOrganizationOwnership";
export async function transferOrganizationOwnership(
  raw: unknown,
): Promise<OrganizationMutationOutput> {
  const input = transferOrganizationOwnershipInputSchema.parse(raw);
  const ctx = await requireUser();
  const result = await execute(ctx, input);
  return organizationMutationOutputSchema.parse(result);
}
