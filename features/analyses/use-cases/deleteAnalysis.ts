import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { deleteOrganizationAnalysis } from "../repositories/deleteAnalysis";
import type { DeleteAnalysisInput } from "../schemas/deleteAnalysisInput";

export async function deleteAnalysis(
  ctx: OperationContext,
  input: DeleteAnalysisInput,
): Promise<{ ok: boolean }> {
  const deleted = await deleteOrganizationAnalysis(
    ctx.db,
    input.id,
    ctx.organizationId,
  );
  return { ok: deleted };
}
