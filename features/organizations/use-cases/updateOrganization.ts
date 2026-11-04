import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { UpdateOrganizationInput } from "../schemas/updateOrganizationInput";
import type { OrganizationMutationOutput } from "../schemas/organizationMutationOutput";
import { updateOrganization as persist } from "../repositories/organizations";
export async function updateOrganization(
  ctx: OperationContext,
  input: UpdateOrganizationInput,
): Promise<OrganizationMutationOutput> {
  if (ctx.role === "member") return { ok: false, code: "FORBIDDEN" };
  const result = await persist(ctx.db, input);
  return result;
}
