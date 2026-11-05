import { NextResponse, type NextRequest } from "next/server";
import { getComparisonAiWorkspace } from "@/features/comparison-ai/queries/getComparisonAiWorkspace";
import { comparisonAiBusinessError } from "@/features/comparison-ai/schemas/businessError";
export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/analyses/[id]/ai">,
) {
  const { id } = await context.params;
  try {
    const data = await getComparisonAiWorkspace({ analysisId: id });
    return NextResponse.json(data);
  } catch (error) {
    const code = comparisonAiBusinessError(error);
    if (code) return NextResponse.json({ error: code }, { status: 404 });
    throw error;
  }
}
