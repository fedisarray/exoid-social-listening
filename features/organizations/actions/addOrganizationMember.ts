"use server";
import { requireUser } from "@/lib/auth/dal";
import { addOrganizationMemberInputSchema } from "../schemas/addOrganizationMemberInput";
import {
  organizationMutationOutputSchema,
  type OrganizationMutationOutput,
} from "../schemas/organizationMutationOutput";
import { addOrganizationMember as execute } from "../use-cases/addOrganizationMember";
export async function addOrganizationMember(
  raw: unknown,
): Promise<OrganizationMutationOutput> {
  const input = addOrganizationMemberInputSchema.parse(raw);
  const ctx = await requireUser();
  const result = await execute(ctx, input);
  return organizationMutationOutputSchema.parse(result);
}
