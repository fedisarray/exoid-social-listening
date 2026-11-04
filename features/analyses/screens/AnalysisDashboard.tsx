"use client";
import { ComparisonReports } from "@/features/reports/components/ComparisonReports";
import type { ListComparisonReportsOutput } from "@/features/reports/schemas/listComparisonReportsOutput";
import { WorkspaceHeader } from "@/features/_shared/components/WorkspaceHeader";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  SlidersHorizontal,
  CalendarRange,
  ChevronDown,
  FileDown,
} from "lucide-react";
import { ComparisonSyncControl } from "@/features/reviews/components/ComparisonSyncControl";
import { useReviewDashboard } from "@/features/reviews/hooks/useReviewDashboard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { dashboardPeriod } from "../domain/dashboardPeriod";
import { ReviewDashboardContent } from "@/features/reviews/components/ReviewDashboard";
import type { GetReviewDashboardInput } from "@/features/reviews/schemas/getReviewDashboardInput";
import type { ReviewDashboard as ReviewData } from "@/features/reviews/schemas/getReviewDashboardOutput";
import type { AnalysisDetail } from "../schemas/analysisDetail";
import { PeriodFields } from "../components/PeriodFields";
import { Choice } from "@/features/_shared/components/Choice";
import { ListingThumbnail } from "@/features/_shared/components/ListingThumbnail";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
export function AnalysisDashboard({
  analysis,
  initialReviews,
  initialReports,
}: {
  analysis: AnalysisDetail;
  initialReports: ListComparisonReportsOutput;
  initialReviews: { input: GetReviewDashboardInput; data: ReviewData };
}) {
  const t = useTranslations("app");
  const locale = useLocale();
  const path = usePathname();
  const search = useSearchParams();
  const sections = {
    overview: ["overview", "sectionOverview"],
    trends: ["trends", "sectionTrends"],
    shared: ["sharedSection", "sectionShared"],
    evidence: ["evidenceSection", "sectionEvidence"],
  } as const;
  const requested = search.get("section") ?? "overview";
  const section = Object.hasOwn(sections, requested)
    ? (requested as keyof typeof sections)
    : "overview";
  const saved = analysis.config.period;
  const params = Object.fromEntries(search.entries());
  const period = dashboardPeriod(saved, params);
  const reviewInput: GetReviewDashboardInput = {
    analysisId: analysis.id,
    period,
    ...(params.snapshot ? { snapshotId: params.snapshot } : {}),
  };
  const dashboard = useReviewDashboard(reviewInput, initialReviews);
  const role = ["primary", "additionalOwn", "competitor", "anchor"].includes(
    params.role,
  )
    ? params.role
    : "all";
  const primary = analysis.config.listings.find(
    (listing) => listing.role === "primary",
  );
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  // Intl range spacing differs between Node and browser locale data.
  const range = (start: string, end: string) =>
    date
      .formatRange(new Date(`${start}T00:00:00Z`), new Date(`${end}T00:00:00Z`))
      .replace(/\s/g, " ");
  function update(patch: Record<string, string>) {
    const next = new URL(window.location.href);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.searchParams.set(key, value);
      else next.searchParams.delete(key);
    }
    window.history.replaceState(null, "", next);
  }
  return (
    <>
      <Link
        href="/analyses"
        className="inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" />
        {t("back")}
      </Link>
      <header className="mt-4 exoid-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex w-full min-w-0 items-start gap-4 sm:w-auto sm:flex-1 md:gap-5">
            <ListingThumbnail
              listing={primary}
              className="size-14 sm:size-16"
            />
            <div className="min-w-0">
              <h1 className="page-title break-words">{analysis.name}</h1>
              {primary ? (
                <p className="mt-2 text-sm font-medium break-words">
                  {primary.label}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <Badge variant="secondary">
                  {t("version")} {analysis.version}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {t("propertyCount", {
                    count: analysis.config.listings.length,
                  })}
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {t("savedScope")}: {range(saved.start, saved.end)}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("updated")}{" "}
                <time dateTime={analysis.updatedAt}>
                  {date.format(new Date(analysis.updatedAt))}
                </time>
              </p>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:justify-end">
            <ComparisonSyncControl
              analysisId={analysis.id}
              period={period}
              dashboard={dashboard}
              onLive={() => update({ snapshot: "" })}
            />
            <Link
              data-slot="button"
              data-variant="outline"
              data-size="default"
              href={`/exports?${new URLSearchParams({ analysis: analysis.id, ...Object.fromEntries(Object.entries(period).map(([key, value]) => [key, String(value)])), ...(params.snapshot ? { snapshot: params.snapshot } : {}) })}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <FileDown className="size-4" aria-hidden="true" />
              {t("exports")}
            </Link>
            <Link
              data-slot="button"
              data-variant="outline"
              data-size="default"
              href={`/analyses/${analysis.id}/setup`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <SlidersHorizontal className="size-4" />
              {t("editAnalysis")}
            </Link>
          </div>
        </div>
      </header>
      <ComparisonReports
        analysisId={analysis.id}
        version={analysis.version}
        period={period}
        snapshotId={params.snapshot || undefined}
        ready={Boolean(dashboard.query.data?.comparisonReady)}
        initialData={initialReports}
      />
      <nav
        aria-label={t("analysisSectionNavigation")}
        className="mt-5 flex gap-x-2 overflow-x-auto border-b"
      >
        {Object.entries(sections).map(([value, copy]) => {
          const next = new URLSearchParams(search.toString());
          next.set("section", value);
          return (
            <Link
              key={value}
              href={`${path}?${next}`}
              scroll={false}
              prefetch={false}
              onNavigate={(event) => {
                event.preventDefault();
                const url = new URL(window.location.href);
                url.searchParams.set("section", value);
                if (url.href !== window.location.href)
                  window.history.pushState(null, "", url);
              }}
              aria-current={section === value ? "page" : undefined}
              className={cn(
                "min-h-11 shrink-0 border-b-2 px-3 py-3 text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                section === value
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t(copy[0])}
            </Link>
          );
        })}
      </nav>
      <WorkspaceHeader>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="text-sm font-medium">{t("periodFilters")}</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-auto min-h-10 max-w-full justify-start py-2 text-left whitespace-normal"
              >
                <CalendarRange className="size-4" aria-hidden="true" />
                <span className="sr-only">{t("periodFilters")}: </span>
                {range(period.start, period.end)}
                <ChevronDown className="size-4" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              collisionPadding={20}
              className="max-h-[var(--radix-popover-content-available-height)] w-[min(40rem,calc(100vw-2.5rem))] overflow-y-auto p-5"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <PeriodFields
                  value={period}
                  onChange={(value) =>
                    update(
                      Object.fromEntries(
                        Object.entries(value).map(([key, value]) => [
                          key,
                          String(value),
                        ]),
                      ),
                    )
                  }
                />
                <div>
                  <h2 className="text-sm font-medium">{t("savedScope")}</h2>
                  <p className="mt-2 text-sm tabular-nums">
                    {range(saved.start, saved.end)}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t("exploreHint")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      window.history.replaceState(
                        null,
                        "",
                        `${path}?section=${section}`,
                      )
                    }
                  >
                    {t("reset")}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-full sm:w-52">
          <Choice
            label={t("role")}
            value={role}
            onChange={(role) => update({ role })}
            options={[
              "all",
              "primary",
              "additionalOwn",
              "competitor",
              "anchor",
            ].map((value) => ({ value, label: t(value) }))}
          />
        </div>
      </WorkspaceHeader>
      <section className="mt-6 min-w-0">
        <h2 className="text-lg font-semibold">{t(sections[section][0])}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t(sections[section][1])}
        </p>
        <ReviewDashboardContent
          dashboard={dashboard}
          section={section}
          version={analysis.version}
          listings={analysis.config.listings}
          role={role}
          initial={initialReviews}
          input={reviewInput}
          onSnapshot={(snapshot) =>
            update({ snapshot: snapshot === "latest" ? "" : snapshot })
          }
        />
      </section>
    </>
  );
}
