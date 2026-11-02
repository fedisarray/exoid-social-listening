"use server";
import { requireUser } from "@/lib/auth/dal";
import { getAnalysis as execute } from "../use-cases/getAnalysis";
import { getAnalysisInputSchema } from "../schemas/getAnalysisInput";
import { getAnalysisOutputSchema } from "../schemas/getAnalysisOutput";
import type { AnalysisDetail } from "../schemas/analysisDetail";
export async function getAnalysis(
  raw: unknown,
): Promise<AnalysisDetail | null> {
  const input = getAnalysisInputSchema.parse(raw);
  const ctx = await requireUser();
  const output = await execute(ctx, input.id);
  return getAnalysisOutputSchema.parse(output);
}
