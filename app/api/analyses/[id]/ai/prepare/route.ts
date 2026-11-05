import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/dal";
import { prepareComparisonAiSnapshotsUseCase } from "@/features/comparison-ai/use-cases/prepareComparisonAiSnapshots";
import { prepareComparisonAiSnapshotsInputSchema } from "@/features/comparison-ai/schemas/prepareComparisonAiSnapshotsInput";
import { prepareComparisonAiSnapshotsOutputSchema } from "@/features/comparison-ai/schemas/prepareComparisonAiSnapshotsOutput";
import { comparisonAiBusinessError } from "@/features/comparison-ai/schemas/businessError";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/analyses/[id]/ai/prepare">,
) {
  const { id } = await context.params;
  const raw = prepareComparisonAiSnapshotsInputSchema.parse({
    analysisId: id,
    ...(await request.json()),
  });
  const ctx = await requireUser();
  try {
    const result = await prepareComparisonAiSnapshotsUseCase(ctx, raw);
    return NextResponse.json(
      prepareComparisonAiSnapshotsOutputSchema.parse(result),
    );
  } catch (error) {
    const code = comparisonAiBusinessError(error);
    if (code)
      return NextResponse.json(
        { error: code },
        { status: code === "SCOPE_NOT_FOUND" ? 404 : 400 },
      );
    throw error;
  }
}
