import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { buildReviewExcel } from "@/features/reviews/domain/buildReviewExcel";
import type { GetComparisonAiWorkbookInput } from "../schemas/getComparisonAiWorkbookInput";
import { getComparisonAiWorkbook } from "./getComparisonAiWorkbook";

export async function exportComparisonAiWorkbook(
  ctx: OperationContext,
  input: GetComparisonAiWorkbookInput,
): Promise<Uint8Array> {
  const workbook = await getComparisonAiWorkbook(ctx, input);
  const report = {
    locale: "en" as const,
    includeCharts: false,
    sheets: workbook.sheets.map((sheet) => ({
      name: sheet.name,
      title: sheet.name,
      format: "0.00" as const,
      rows: [
        sheet.columns,
        ...sheet.rows.map((row) =>
          row.map((cell) => (typeof cell === "boolean" ? String(cell) : cell)),
        ),
      ],
      notes: [sheet.description],
      samples: [],
    })),
  };
  return buildReviewExcel(report);
}
