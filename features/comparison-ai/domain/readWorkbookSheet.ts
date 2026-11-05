import { z } from "zod";
import type { ComparisonAiWorkbook } from "../schemas/comparisonAiWorkbook";

export const readWorkbookSheetInputSchema = z.object({
  sheet: z.string().min(1).max(31),
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(25),
  search: z.string().max(200).optional(),
  selectedPeriodOnly: z.boolean().default(true),
});

export function readWorkbookSheet(
  workbook: ComparisonAiWorkbook,
  raw: unknown,
): {
  sheet: string;
  columns: string[];
  totalMatchingRows: number;
  rows: { excelRow: number; cells: (string | number | boolean | null)[] }[];
  nextOffset: number | null;
} {
  const input = readWorkbookSheetInputSchema.parse(raw);
  const sheet = workbook.sheets.find((sheet) => sheet.name === input.sheet);
  if (!sheet) throw new Error("WORKBOOK_SHEET_NOT_FOUND");
  const inPeriod = sheet.columns.indexOf("inSelectedPeriod");
  const search = input.search?.toLocaleLowerCase();
  const matches = sheet.rows.flatMap((cells, index) => {
    if (input.selectedPeriodOnly && inPeriod !== -1 && cells[inPeriod] !== true)
      return [];
    if (
      search &&
      !cells.some(
        (cell) =>
          typeof cell === "string" && cell.toLocaleLowerCase().includes(search),
      )
    )
      return [];
    return [{ excelRow: index + 2, cells }];
  });
  const rows: typeof matches = [];
  let size = 0;
  for (const row of matches.slice(input.offset, input.offset + input.limit)) {
    const length = JSON.stringify(row).length;
    if (rows.length && size + length > 60_000) break;
    rows.push(row);
    size += length;
  }
  const end = input.offset + rows.length;
  return {
    sheet: sheet.name,
    columns: sheet.columns,
    totalMatchingRows: matches.length,
    rows,
    nextOffset: end < matches.length ? end : null,
  };
}
