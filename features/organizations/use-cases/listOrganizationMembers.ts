import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { ListOrganizationMembersOutput } from "../schemas/listOrganizationMembersOutput";
import { readOrganizationMembers } from "../repositories/organizations";
export async function listOrganizationMembers(
  ctx: OperationContext,
): Promise<ListOrganizationMembersOutput> {
  const result = await readOrganizationMembers(ctx.db, ctx.organizationId);
  return result;
}
