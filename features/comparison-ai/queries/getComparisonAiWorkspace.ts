import "server-only";
import { requireUser } from "@/lib/auth/dal";
import { getComparisonAiWorkspace as execute } from "../use-cases/getComparisonAiWorkspace";
import { getComparisonAiWorkspaceInputSchema } from "../schemas/getComparisonAiWorkspaceInput";
import {
  comparisonAiWorkspaceSchema,
  type ComparisonAiWorkspace,
} from "../schemas/workspace";
export async function getComparisonAiWorkspace(
  raw: unknown,
): Promise<ComparisonAiWorkspace> {
  const input = getComparisonAiWorkspaceInputSchema.parse(raw);
  const ctx = await requireUser();
  const result = await execute(ctx, input.analysisId);
  return comparisonAiWorkspaceSchema.parse(result);
}
