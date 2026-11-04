"use server";
import { requireUser } from "@/lib/auth/dal";
import { deleteAnalysisInputSchema } from "../schemas/deleteAnalysisInput";
import {
  deleteAnalysisOutputSchema,
  type DeleteAnalysisOutput,
} from "../schemas/deleteAnalysisOutput";
import { deleteAnalysis as execute } from "../use-cases/deleteAnalysis";

export async function deleteAnalysis(
  raw: unknown,
): Promise<DeleteAnalysisOutput> {
  const input = deleteAnalysisInputSchema.parse(raw);
  const ctx = await requireUser();
  let output;
  try {
    output = await execute(ctx, input);
  } catch (error) {
    console.error("DELETE_ANALYSIS_FAILED", error);
    throw new Error("DELETE_ANALYSIS_FAILED");
  }
  return deleteAnalysisOutputSchema.parse(output);
}
