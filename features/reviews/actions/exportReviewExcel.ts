"use server";

import { requireUser } from "@/lib/auth/dal";
import { exportReviewExcelInputSchema } from "../schemas/exportReviewExcelInput";
import {
  exportReviewExcelOutputSchema,
  type ExportReviewExcelOutput,
} from "../schemas/exportReviewExcelOutput";
import { exportReviewExcel as execute } from "../use-cases/exportReviewExcel";

export async function exportReviewExcel(
  raw: unknown,
): Promise<ExportReviewExcelOutput> {
  const input = exportReviewExcelInputSchema.parse(raw);
  const ctx = await requireUser();
  const output = await execute(ctx, input);
  return exportReviewExcelOutputSchema.parse(output);
}
