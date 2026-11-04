import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { deleteOwnedAnalysis } from "../repositories/deleteAnalysis";
import type { DeleteAnalysisInput } from "../schemas/deleteAnalysisInput";

export async function deleteAnalysis(
  ctx: OperationContext,
  input: DeleteAnalysisInput,
): Promise<{ ok: boolean }> {
  const deleted = await deleteOwnedAnalysis(ctx.db, input.id, ctx.userId);
  return { ok: deleted };
}
