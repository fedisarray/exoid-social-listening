import "server-only";
import { requireUser } from "@/lib/auth/dal";
import { listAnalyses as execute } from "../use-cases/listAnalyses";
import { listAnalysesInputSchema } from "../schemas/listAnalysesInput";
import { listAnalysesOutputSchema } from "../schemas/listAnalysesOutput";
import type { AnalysisSummary } from "../schemas/analysisDetail";
export async function listAnalyses(raw: unknown): Promise<AnalysisSummary[]> {
  const input = listAnalysesInputSchema.parse(raw);
  void input;
  const ctx = await requireUser();
  const output = await execute(ctx);
  return listAnalysesOutputSchema.parse(output);
}
