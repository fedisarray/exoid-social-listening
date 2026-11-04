"use server";
import { requireUser } from "@/lib/auth/dal";
import { startComparisonReportInputSchema } from "../schemas/startComparisonReportInput";
import {
  startComparisonReportOutputSchema,
  type StartComparisonReportOutput,
} from "../schemas/startComparisonReportOutput";
import { startComparisonReport as execute } from "../use-cases/startComparisonReport";
export async function startComparisonReport(
  raw: unknown,
): Promise<StartComparisonReportOutput> {
  const input = startComparisonReportInputSchema.parse(raw);
  const ctx = await requireUser();
  const result = await execute(ctx, input);
  return startComparisonReportOutputSchema.parse(result);
}
