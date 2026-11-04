import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { deleteOrganizationProperty } from "../repositories/properties";
import type { DeletePropertyOutput } from "../schemas/deletePropertyOutput";
export async function deleteProperty(
  ctx: OperationContext,
  id: string,
): Promise<DeletePropertyOutput> {
  const deleted = await deleteOrganizationProperty(
    ctx.db,
    ctx.organizationId,
    id,
  );
  return deleted ? { ok: true } : { ok: false, code: "PROPERTY_NOT_FOUND" };
}
