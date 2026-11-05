import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { PrepareComparisonAiSnapshotsInput } from "../schemas/prepareComparisonAiSnapshotsInput";
import { prepareComparisonAiSnapshots } from "../repositories/comparisonAi";

export type PrepareComparisonAiSnapshotsOutput = {
  importId: string;
  rowCount: number;
};

export async function prepareComparisonAiSnapshotsUseCase(
  ctx: OperationContext,
  input: PrepareComparisonAiSnapshotsInput,
): Promise<PrepareComparisonAiSnapshotsOutput> {
  const result = await prepareComparisonAiSnapshots(ctx, input);
  return { importId: result.importId, rowCount: result.rowCount };
}
