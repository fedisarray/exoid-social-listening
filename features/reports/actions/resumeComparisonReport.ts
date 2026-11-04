"use server";
import { requireUser } from "@/lib/auth/dal";
import { resumeComparisonReportInputSchema } from "../schemas/resumeComparisonReportInput";
import {
  startComparisonReportOutputSchema,
  type StartComparisonReportOutput,
} from "../schemas/startComparisonReportOutput";
import { resumeComparisonReport as execute } from "../use-cases/resumeComparisonReport";
export async function resumeComparisonReport(
  raw: unknown,
): Promise<StartComparisonReportOutput> {
  const input = resumeComparisonReportInputSchema.parse(raw);
  const ctx = await requireUser();
  const result = await execute(ctx, input);
  return startComparisonReportOutputSchema.parse(result);
}
