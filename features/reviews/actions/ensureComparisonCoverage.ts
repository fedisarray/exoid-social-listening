"use server";
import { requireUser } from "@/lib/auth/dal";
import { ensureComparisonCoverageInputSchema } from "../schemas/ensureComparisonCoverageInput";
import {
  ensureComparisonCoverageOutputSchema,
  type EnsureComparisonCoverageOutput,
} from "../schemas/ensureComparisonCoverageOutput";
import { ensureComparisonCoverage as execute } from "../use-cases/ensureComparisonCoverage";
export async function ensureComparisonCoverage(
  raw: unknown,
): Promise<EnsureComparisonCoverageOutput> {
  const input = ensureComparisonCoverageInputSchema.parse(raw);
  const ctx = await requireUser();
  const result = await execute(ctx, input);
  return ensureComparisonCoverageOutputSchema.parse(result);
}
