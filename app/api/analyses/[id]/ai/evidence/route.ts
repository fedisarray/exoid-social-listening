import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/dal";
import { periodSchema } from "@/features/_shared/schemas/period";
import { getComparisonAiEvidenceInputSchema } from "@/features/comparison-ai/schemas/getComparisonAiEvidenceInput";
import { getComparisonAiEvidenceOutputSchema } from "@/features/comparison-ai/schemas/getComparisonAiEvidenceOutput";
import { getComparisonAiEvidence } from "@/features/comparison-ai/use-cases/getComparisonAiEvidence";
import { comparisonAiBusinessError } from "@/features/comparison-ai/schemas/businessError";
export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/analyses/[id]/ai/evidence">,
) {
  const { id } = await context.params;
  const params = request.nextUrl.searchParams;
  const period = periodSchema.parse({
    kind: params.get("periodKind"),
    year: Number(params.get("year")),
    quarter: Number(params.get("quarter")),
    cutoff: params.get("cutoff"),
    start: params.get("start"),
    end: params.get("end"),
  });
  const input = getComparisonAiEvidenceInputSchema.parse({
    analysisId: id,
    importId: params.get("importId"),
    period,
    kind: params.get("kind"),
    value: params.get("value"),
    offset: params.get("offset") ?? 0,
  });
  const ctx = await requireUser();
  try {
    const result = await getComparisonAiEvidence(ctx, input);
    return NextResponse.json(getComparisonAiEvidenceOutputSchema.parse(result));
  } catch (error) {
    const code = comparisonAiBusinessError(error);
    if (code)
      return NextResponse.json(
        { error: code },
        {
          status:
            code === "SCOPE_NOT_FOUND" || code === "IMPORT_NOT_FOUND"
              ? 404
              : 400,
        },
      );
    throw error;
  }
}
