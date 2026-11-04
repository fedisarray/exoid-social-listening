import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { ChangeOrganizationMemberRoleInput } from "../schemas/changeOrganizationMemberRoleInput";
import type { OrganizationMutationOutput } from "../schemas/organizationMutationOutput";
import { changeOrganizationMemberRole as persist } from "../repositories/organizations";
export async function changeOrganizationMemberRole(
  ctx: OperationContext,
  input: ChangeOrganizationMemberRoleInput,
): Promise<OrganizationMutationOutput> {
  if (ctx.role === "member") return { ok: false, code: "FORBIDDEN" };
  const result = await persist(ctx.db, input);
  return result;
}
