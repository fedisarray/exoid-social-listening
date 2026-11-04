import { listComparisonReports } from "@/features/reports/queries/listComparisonReports";
import { notFound } from "next/navigation";
import { getAnalysisInputSchema } from "../schemas/getAnalysisInput";
import { getAnalysis } from "../queries/getAnalysis";
import { getReviewDashboard } from "@/features/reviews/queries/getReviewDashboard";
import { dashboardPeriod } from "../domain/dashboardPeriod";
import { AnalysisDashboard } from "./AnalysisDashboard";
export async function AnalysisDashboardScreen({
  id,
  searchParams,
}: {
  id: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (!getAnalysisInputSchema.safeParse({ id }).success) notFound();
  const analysis = await getAnalysis({ id });
  if (!analysis) notFound();
  const period = dashboardPeriod(analysis.config.period, searchParams);
  const snapshotId =
    typeof searchParams.snapshot === "string" &&
    /^[0-9a-f-]{36}$/i.test(searchParams.snapshot)
      ? searchParams.snapshot
      : undefined;
  const input = {
    analysisId: id,
    period,
    ...(snapshotId ? { snapshotId } : {}),
  };
  const [data, reports] = await Promise.all([
    getReviewDashboard(input),
    listComparisonReports({ analysisId: id }),
  ]);
  return (
    <AnalysisDashboard
      analysis={analysis}
      initialReviews={{ input, data }}
      initialReports={reports}
    />
  );
}
