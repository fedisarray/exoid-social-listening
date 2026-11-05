import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/dal";
import { getComparisonAiWorkbookInputSchema } from "@/features/comparison-ai/schemas/getComparisonAiWorkbookInput";
import { exportComparisonAiWorkbook } from "@/features/comparison-ai/use-cases/exportComparisonAiWorkbook";
import { comparisonAiBusinessError } from "@/features/comparison-ai/schemas/businessError";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/analyses/[id]/ai/workbook">,
): Promise<Response> {
  const { id } = await context.params;
  const params = request.nextUrl.searchParams;
  const input = getComparisonAiWorkbookInputSchema.parse({
    analysisId: id,
    importId: params.get("importId"),
    period: {
      kind: params.get("kind"),
      year: Number(params.get("year")),
      quarter: Number(params.get("quarter")),
      cutoff: params.get("cutoff"),
      start: params.get("start"),
      end: params.get("end"),
    },
  });
  const ctx = await requireUser();
  try {
    const result = await exportComparisonAiWorkbook(ctx, input);
    const body = new Uint8Array(result);
    return new Response(body, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="comparison-ai-${input.importId}.xlsx"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const code = comparisonAiBusinessError(error);
    if (code)
      return Response.json(
        { error: code },
        {
          status:
            code === "IMPORT_NOT_FOUND" || code === "SNAPSHOT_NOT_FOUND"
              ? 404
              : 400,
        },
      );
    throw error;
  }
}
