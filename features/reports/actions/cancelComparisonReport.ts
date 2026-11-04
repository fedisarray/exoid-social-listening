"use server";
import { requireUser } from "@/lib/auth/dal";
import { cancelComparisonReportInputSchema } from "../schemas/cancelComparisonReportInput";
import {
  cancelComparisonReportOutputSchema,
  type CancelComparisonReportOutput,
} from "../schemas/cancelComparisonReportOutput";
import { cancelComparisonReport as execute } from "../use-cases/cancelComparisonReport";
export async function cancelComparisonReport(
  raw: unknown,
): Promise<CancelComparisonReportOutput> {
  const input = cancelComparisonReportInputSchema.parse(raw);
  const ctx = await requireUser();
  const result = await execute(ctx, input);
  return cancelComparisonReportOutputSchema.parse(result);
}
