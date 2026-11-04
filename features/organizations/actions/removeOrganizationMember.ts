"use server";
import { requireUser } from "@/lib/auth/dal";
import { removeOrganizationMemberInputSchema } from "../schemas/removeOrganizationMemberInput";
import {
  organizationMutationOutputSchema,
  type OrganizationMutationOutput,
} from "../schemas/organizationMutationOutput";
import { removeOrganizationMember as execute } from "../use-cases/removeOrganizationMember";
export async function removeOrganizationMember(
  raw: unknown,
): Promise<OrganizationMutationOutput> {
  const input = removeOrganizationMemberInputSchema.parse(raw);
  const ctx = await requireUser();
  const result = await execute(ctx, input);
  return organizationMutationOutputSchema.parse(result);
}
