import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { RemoveOrganizationMemberInput } from "../schemas/removeOrganizationMemberInput";
import type { OrganizationMutationOutput } from "../schemas/organizationMutationOutput";
import { removeOrganizationMember as persist } from "../repositories/organizations";
export async function removeOrganizationMember(
  ctx: OperationContext,
  input: RemoveOrganizationMemberInput,
): Promise<OrganizationMutationOutput> {
  if (ctx.role === "member") return { ok: false, code: "FORBIDDEN" };
  const result = await persist(ctx.db, input);
  return result;
}
