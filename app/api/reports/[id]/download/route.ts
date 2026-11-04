import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/dal";
import { getComparisonReportDownloadInputSchema } from "@/features/reports/schemas/getComparisonReportDownloadInput";
import { getComparisonReportDownloadOutputSchema } from "@/features/reports/schemas/getComparisonReportDownloadOutput";
import { getComparisonReportDownload } from "@/features/reports/use-cases/getComparisonReportDownload";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const parsed = getComparisonReportDownloadInputSchema.safeParse({
    reportId: id,
  });
  if (!parsed.success)
    return NextResponse.json({ error: "REPORT_NOT_FOUND" }, { status: 404 });
  const ctx = await requireUser();
  const result = await getComparisonReportDownload(ctx, parsed.data);
  const output = getComparisonReportDownloadOutputSchema.parse(result);
  if (!output.ok)
    return NextResponse.json(
      { error: output.code },
      { status: output.code === "REPORT_NOT_FOUND" ? 404 : 409 },
    );
  const response = NextResponse.redirect(output.url, 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
