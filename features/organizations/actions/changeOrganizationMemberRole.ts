"use server";
import { requireUser } from "@/lib/auth/dal";
import { changeOrganizationMemberRoleInputSchema } from "../schemas/changeOrganizationMemberRoleInput";
import {
  organizationMutationOutputSchema,
  type OrganizationMutationOutput,
} from "../schemas/organizationMutationOutput";
import { changeOrganizationMemberRole as execute } from "../use-cases/changeOrganizationMemberRole";
export async function changeOrganizationMemberRole(
  raw: unknown,
): Promise<OrganizationMutationOutput> {
  const input = changeOrganizationMemberRoleInputSchema.parse(raw);
  const ctx = await requireUser();
  const result = await execute(ctx, input);
  return organizationMutationOutputSchema.parse(result);
}
