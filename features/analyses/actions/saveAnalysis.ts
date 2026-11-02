"use server";
import { requireUser } from "@/lib/auth/dal";
import { saveAnalysisInputSchema } from "../schemas/saveAnalysisInput";
import {
  saveAnalysisOutputSchema,
  type SaveAnalysisOutput,
} from "../schemas/saveAnalysisOutput";
import { saveAnalysis as execute } from "../use-cases/saveAnalysis";
export async function saveAnalysis(raw: unknown): Promise<SaveAnalysisOutput> {
  const input = saveAnalysisInputSchema.parse(raw);
  const ctx = await requireUser();
  const output = await execute(ctx, input);
  return saveAnalysisOutputSchema.parse(output);
}
