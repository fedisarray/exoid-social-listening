import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { AddOrganizationMemberInput } from "../schemas/addOrganizationMemberInput";
import type { OrganizationMutationOutput } from "../schemas/organizationMutationOutput";
import { addOrganizationMember as persist } from "../repositories/organizations";
export async function addOrganizationMember(
  ctx: OperationContext,
  input: AddOrganizationMemberInput,
): Promise<OrganizationMutationOutput> {
  if (ctx.role === "member") return { ok: false, code: "FORBIDDEN" };
  const result = await persist(ctx.db, input);
  return result;
}
