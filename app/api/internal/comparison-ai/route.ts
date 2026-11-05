import { NextResponse, type NextRequest } from "next/server";
import { requireComparisonAiWorker } from "@/lib/auth/dal";
import { processComparisonAiJob } from "@/features/comparison-ai/use-cases/processComparisonAiJob";
import { processComparisonAiJobOutputSchema } from "@/features/comparison-ai/schemas/processComparisonAiJobOutput";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ctx = await requireComparisonAiWorker(
    request.headers.get("authorization"),
  );
  if (!ctx)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const result = await processComparisonAiJob(ctx);
  return NextResponse.json(processComparisonAiJobOutputSchema.parse(result));
}
