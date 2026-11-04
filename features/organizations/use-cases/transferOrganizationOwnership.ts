import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { TransferOrganizationOwnershipInput } from "../schemas/transferOrganizationOwnershipInput";
import type { OrganizationMutationOutput } from "../schemas/organizationMutationOutput";
import { transferOrganizationOwnership as persist } from "../repositories/organizations";
export async function transferOrganizationOwnership(
  ctx: OperationContext,
  input: TransferOrganizationOwnershipInput,
): Promise<OrganizationMutationOutput> {
  if (ctx.role !== "owner") return { ok: false, code: "FORBIDDEN" };
  const result = await persist(ctx.db, input);
  return result;
}
