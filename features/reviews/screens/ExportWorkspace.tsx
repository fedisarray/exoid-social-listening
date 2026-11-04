"use client";

import { ComparisonReports } from "@/features/reports/components/ComparisonReports";
import { reviewExcelOptionsSchema } from "../schemas/reviewExcelOptions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, LoaderCircle } from "lucide-react";
import type {
  AnalysisDetail,
  AnalysisSummary,
} from "@/features/analyses/schemas/analysisDetail";
import { PeriodFields } from "@/features/analyses/components/PeriodFields";
import { Choice } from "@/features/_shared/components/Choice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useReviewDashboard } from "../hooks/useReviewDashboard";
import type { GetReviewDashboardInput } from "../schemas/getReviewDashboardInput";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
import {
  exportReviewExcelInputSchema,
  type ExportReviewExcelInput,
} from "../schemas/exportReviewExcelInput";
import { reviewExcelSheets } from "../schemas/reviewExcelOptions";
import { exportReviewExcel } from "../actions/exportReviewExcel";
import { windowCovered } from "../domain/reviewCoverage";

export function ExportWorkspace({
  analyses,
  analysis,
  initialReviews,
}: {
  analyses: AnalysisSummary[];
  analysis: AnalysisDetail;
  initialReviews: { input: GetReviewDashboardInput; data: ReviewDashboard };
}) {
  const t = useTranslations("reviews");
  const app = useTranslations("app");
  const locale = useLocale();
  const router = useRouter();
  const client = useQueryClient();
  const form = useForm<ExportReviewExcelInput>({
    resolver: zodResolver(exportReviewExcelInputSchema),
    mode: "onChange",
    defaultValues: {
      analysisId: analysis.id,
      expectedVersion: analysis.version,
      locale: locale === "en" ? "en" : "it",
      snapshotId: initialReviews.input.snapshotId,
      period: initialReviews.input.period,
      options: {
        listingIds: initialReviews.data.coverage.map(
          (place) => place.listingId,
        ),
        sheets: [...reviewExcelSheets],
        historyYears: 5,
        includeCharts: true,
      },
    },
  });
  const period = useWatch({ control: form.control, name: "period" });
  const reportLocale = useWatch({ control: form.control, name: "locale" });
  const snapshotId = useWatch({ control: form.control, name: "snapshotId" });
  const options = useWatch({ control: form.control, name: "options" });
  const validPeriod =
    exportReviewExcelInputSchema.shape.period.safeParse(period);
  const input: GetReviewDashboardInput = {
    analysisId: analysis.id,
    period: validPeriod.success
      ? validPeriod.data
      : initialReviews.input.period,
    ...(snapshotId ? { snapshotId } : {}),
  };
  const { query } = useReviewDashboard(input, initialReviews);
  const data = query.data;
  const selectedPlaces =
    data?.coverage.filter((place) =>
      options.listingIds.includes(place.listingId),
    ) ?? [];
  const selectedCovered =
    validPeriod.success &&
    selectedPlaces.length === options.listingIds.length &&
    windowCovered(selectedPlaces, validPeriod.data);
  const canFreeze = Boolean(
    snapshotId ||
    (data && windowCovered(data.coverage, analysis.config.period)),
  );
  const download = useMutation({
    mutationFn: async (values: ExportReviewExcelInput) => {
      const result = await exportReviewExcel(values);
      if (!result.ok) throw new Error(result.code);
      const bytes = Uint8Array.from(atob(result.content), (char) =>
        char.charCodeAt(0),
      );
      const url = URL.createObjectURL(
        new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return result.snapshotId;
    },
    onSuccess: (id) => {
      form.setValue("snapshotId", id);
      const next = new URL(window.location.href);
      next.searchParams.set("snapshot", id);
      window.history.replaceState(null, "", next);
      void client.invalidateQueries({
        queryKey: ["review-dashboard", analysis.id],
      });
    },
  });
  const sheetLabels = {
    reviews: "trendVolume",
    rating: "rating",
    quarterRating:
      period.kind === "quarter" ? "trendQuarterRating" : "exportPeriodRating",
    satisfaction: "satisfied",
    quarterSatisfaction:
      period.kind === "quarter"
        ? "trendQuarterSatisfaction"
        : "exportPeriodSatisfaction",
    anchorRating: "trendAnchorRating",
    anchorSatisfaction: "trendAnchorSatisfaction",
  } as const;
  const errors: Record<string, string> = {
    COVERAGE_INCOMPLETE: "excelCoverageError",
    CONFIGURATION_CHANGED: "excelVersionError",
    ANALYSIS_NOT_FOUND: "excelNotFound",
    INVALID_SELECTION: "exportInvalidSelection",
  };
  return (
    <>
      <h1 className="page-title">{app("exports")}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {t("exportWorkspaceDescription")}
      </p>
      <div className="mt-8 max-w-xl space-y-2">
        <Label htmlFor="export-analysis">{t("exportComparison")}</Label>
        <Choice
          id="export-analysis"
          label={t("exportComparison")}
          value={analysis.id}
          disabled={download.isPending}
          onChange={(id) => router.push(`/exports?analysis=${id}`)}
          options={analyses.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
        />
      </div>
      <form
        onSubmit={form.handleSubmit((values) => download.mutate(values))}
        className="mt-7 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <fieldset
          disabled={download.isPending}
          className="min-w-0 space-y-4 disabled:opacity-70"
        >
          <section className="space-y-4 exoid-panel p-4 sm:p-5">
            <h2 className="text-lg font-semibold">{t("exportScope")}</h2>
            <Controller
              control={form.control}
              name="period"
              render={({ field }) => (
                <PeriodFields value={field.value} onChange={field.onChange} />
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="export-dataset">{t("excelDataset")}</Label>
              <Choice
                id="export-dataset"
                label={t("excelDataset")}
                value={snapshotId ?? "live"}
                disabled={query.isFetching}
                onChange={(id) => {
                  form.setValue("snapshotId", id === "live" ? undefined : id, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  form.setValue("options.listingIds", [], {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                options={[
                  { value: "live", label: t("exportNewDataset") },
                  ...(data?.snapshots ?? initialReviews.data.snapshots).map(
                    (snapshot) => ({
                      value: snapshot.id,
                      label: `${new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(snapshot.createdAt))} · v${snapshot.version}`,
                    }),
                  ),
                ]}
              />
              <p className="text-sm text-muted-foreground">
                {t(snapshotId ? "exportFrozenHint" : "excelNewDataset")}
              </p>
            </div>
          </section>
          <section className="space-y-4 exoid-panel p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{t("exportProperties")}</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!data || query.isFetching}
                onClick={() =>
                  form.setValue(
                    "options.listingIds",
                    data?.coverage.map((place) => place.listingId) ?? [],
                    { shouldDirty: true, shouldValidate: true },
                  )
                }
              >
                {t("exportSelectAll")}
              </Button>
            </div>
            <fieldset
              disabled={query.isFetching}
              className="space-y-1"
              aria-busy={query.isFetching}
            >
              <legend className="sr-only">{t("exportProperties")}</legend>
              {(data?.coverage ?? []).map((place) => (
                <label
                  key={place.listingId}
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    value={place.listingId}
                    {...form.register("options.listingIds")}
                    className="mt-1 size-4 accent-primary"
                  />
                  <span className="min-w-0 text-sm">
                    <span className="block break-words font-medium">
                      {place.label}
                    </span>
                    <span className="text-muted-foreground">
                      {app.has(place.role) ? app(place.role) : place.role} ·{" "}
                      {t(
                        validPeriod.success &&
                          windowCovered([place], validPeriod.data)
                          ? "coverageReady"
                          : "coverageCheck",
                      )}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
            {query.isFetching ? (
              <p role="status" className="text-sm text-muted-foreground">
                {t("exportChecking")}
              </p>
            ) : null}
            {query.isError ? (
              <div role="alert">
                <p className="text-sm text-destructive">{t("loadError")}</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void query.refetch()}
                >
                  {t("retry")}
                </Button>
              </div>
            ) : null}
          </section>
          <section className="space-y-4 exoid-panel p-4 sm:p-5">
            <h2 className="text-lg font-semibold">{t("exportContent")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("exportContentHint")}
            </p>
            <fieldset className="grid gap-1 sm:grid-cols-2">
              <legend className="sr-only">{t("exportContent")}</legend>
              {reviewExcelSheets.map((sheet) => (
                <label
                  key={sheet}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    value={sheet}
                    {...form.register("options.sheets")}
                    className="size-4 accent-primary"
                  />
                  <span className="text-sm">{t(sheetLabels[sheet])}</span>
                </label>
              ))}
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="export-years">{t("exportHistory")}</Label>
                <Input
                  id="export-years"
                  type="number"
                  min={0}
                  max={20}
                  {...form.register("options.historyYears", {
                    valueAsNumber: true,
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  {t("exportHistoryHint")}
                </p>
              </div>
              <Controller
                control={form.control}
                name="locale"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="export-language">{app("language")}</Label>
                    <Choice
                      id="export-language"
                      label={app("language")}
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: "it", label: "Italiano" },
                        { value: "en", label: "English" },
                      ]}
                    />
                  </div>
                )}
              />
            </div>
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                {...form.register("options.includeCharts")}
                className="size-4 accent-primary"
              />
              <span className="text-sm">{t("exportCharts")}</span>
            </label>
          </section>
        </fieldset>
        <aside className="space-y-5 exoid-panel p-4 sm:p-5 xl:sticky xl:top-6">
          <h2 className="text-lg font-semibold">{t("exportSummary")}</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">{t("exportComparison")}</dt>
              <dd className="mt-1 break-words font-medium">{analysis.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("selected")}</dt>
              <dd className="mt-1 tabular-nums">
                {period.start} — {period.end} (UTC)
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("exportProperties")}</dt>
              <dd className="mt-1">{options.listingIds.length}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("exportContent")}</dt>
              <dd className="mt-1">{options.sheets.length}</dd>
            </div>
          </dl>
          <p className="text-sm text-muted-foreground">{t("excelMissing")}</p>
          {!selectedCovered || !canFreeze ? (
            <p role="status" className="text-sm">
              {t(!canFreeze ? "excelCoverageError" : "exportCoverageHint")}
            </p>
          ) : null}
          {Object.keys(form.formState.errors).length ? (
            <p role="alert" className="text-sm text-destructive">
              {t("exportInvalidSelection")}
            </p>
          ) : null}
          {download.isError ? (
            <p role="alert" className="text-sm text-destructive">
              {t(errors[download.error.message] ?? "excelError")}
            </p>
          ) : null}
          {download.isSuccess ? (
            <p role="status" className="text-sm">
              {t("exportDownloadStarted")}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full"
            disabled={
              download.isPending ||
              query.isFetching ||
              query.isError ||
              !selectedCovered ||
              !canFreeze ||
              !form.formState.isValid
            }
          >
            {download.isPending ? (
              <LoaderCircle
                className="size-4 motion-safe:animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            {t(download.isPending ? "excelGenerating" : "excelDownload")}
          </Button>
          <ComparisonReports
            embedded
            key={analysis.id}
            analysisId={analysis.id}
            version={analysis.version}
            period={input.period}
            snapshotId={snapshotId || undefined}
            options={options}
            reportLocale={reportLocale}
            ready={Boolean(
              selectedCovered &&
              validPeriod.success &&
              reviewExcelOptionsSchema.safeParse(options).success &&
              !query.isFetching &&
              !query.isError,
            )}
          />
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={download.isPending}
            onClick={() => {
              form.reset();
              download.reset();
              const next = new URL(window.location.href);
              if (initialReviews.input.snapshotId)
                next.searchParams.set(
                  "snapshot",
                  initialReviews.input.snapshotId,
                );
              else next.searchParams.delete("snapshot");
              window.history.replaceState(null, "", next);
            }}
          >
            {t("exportReset")}
          </Button>
          <Link
            data-slot="button"
            data-variant="outline"
            data-size="default"
            href={`/analyses/${analysis.id}/dashboard`}
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            {app("openAnalysis")}
          </Link>
        </aside>
      </form>
    </>
  );
}
