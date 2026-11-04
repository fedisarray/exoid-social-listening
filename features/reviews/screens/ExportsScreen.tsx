import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { listAnalyses } from "@/features/analyses/queries/listAnalyses";
import { getAnalysis } from "@/features/analyses/queries/getAnalysis";
import { dashboardPeriod } from "@/features/analyses/domain/dashboardPeriod";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getReviewDashboard } from "../queries/getReviewDashboard";
import { getReviewDashboardInputSchema } from "../schemas/getReviewDashboardInput";
import { ExportWorkspace } from "./ExportWorkspace";

export async function ExportsScreen({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [analyses, t, app] = await Promise.all([
    listAnalyses({}),
    getTranslations("reviews"),
    getTranslations("app"),
  ]);
  const requested =
    typeof searchParams.analysis === "string"
      ? searchParams.analysis
      : analyses[0]?.id;
  if (!requested)
    return (
      <>
        <h1 className="page-title">{app("exports")}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {t("exportWorkspaceDescription")}
        </p>
        <div className="mt-8 max-w-2xl exoid-panel p-5 sm:p-6">
          <h2 className="text-lg font-medium">{app("analysisEmptyTitle")}</h2>
          <p className="text-muted-foreground">{t("exportEmpty")}</p>
          <Link
            data-slot="button"
            data-variant="default"
            data-size="default"
            href="/analyses/new"
            className={cn(buttonVariants())}
          >
            {app("newAnalysis")}
          </Link>
        </div>
      </>
    );
  if (!analyses.some((analysis) => analysis.id === requested)) notFound();
  const analysis = await getAnalysis({ id: requested });
  if (!analysis) notFound();
  const period = dashboardPeriod(analysis.config.period, searchParams);
  const candidate = getReviewDashboardInputSchema.safeParse({
    analysisId: analysis.id,
    period,
    ...(typeof searchParams.snapshot === "string"
      ? { snapshotId: searchParams.snapshot }
      : {}),
  });
  if (!candidate.success) notFound();
  const input = candidate.data;
  const data = await getReviewDashboard(input);
  return (
    <ExportWorkspace
      key={`${analysis.id}-${input.snapshotId ?? "live"}`}
      analyses={analyses}
      analysis={analysis}
      initialReviews={{ input, data }}
    />
  );
}
