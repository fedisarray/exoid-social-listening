import { NextResponse, type NextRequest } from "next/server";
import { requireReportWorker } from "@/lib/auth/dal";
import { processComparisonReport } from "@/features/reports/use-cases/processComparisonReport";
import { processComparisonReportOutputSchema } from "@/features/reports/schemas/processComparisonReportOutput";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ctx = await requireReportWorker(request.headers.get("authorization"));
  if (!ctx)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const result = await processComparisonReport(ctx);
  return NextResponse.json(processComparisonReportOutputSchema.parse(result));
}
