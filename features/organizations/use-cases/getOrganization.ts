import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { GetOrganizationOutput } from "../schemas/getOrganizationOutput";
import { readOrganization } from "../repositories/organizations";
export async function getOrganization(
  ctx: OperationContext,
): Promise<GetOrganizationOutput> {
  const result = await readOrganization(ctx.db, ctx.organizationId);
  return { ...result, role: ctx.role };
}
