"use client";
import Image from "next/image";
import type { ReviewExcelOptions } from "@/features/reviews/schemas/reviewExcelOptions";
import { reviewExcelOptionsSchema } from "@/features/reviews/schemas/reviewExcelOptions";
import { useLocale, useTranslations } from "next-intl";
import { CircleAlert, Download, LoaderCircle, RotateCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Period } from "@/features/_shared/schemas/period";
import type {
  ComparisonReport,
  ReportErrorCode,
} from "../schemas/comparisonReport";
import type { ListComparisonReportsOutput } from "../schemas/listComparisonReportsOutput";
import { useComparisonReports } from "../hooks/useComparisonReports";
export function ComparisonReports({
  analysisId,
  version,
  period,
  snapshotId,
  ready,
  initialData,
  options,
  reportLocale,
  embedded = false,
}: {
  analysisId: string;
  version: number;
  period: Period;
  snapshotId?: string;
  ready: boolean;
  initialData?: ListComparisonReportsOutput;
  options?: ReviewExcelOptions;
  reportLocale?: "it" | "en";
  embedded?: boolean;
}) {
  const t = useTranslations("reports");
  const locale = useLocale();
  const { query, generate, resume, cancel } = useComparisonReports(
    analysisId,
    initialData,
  );
  const reports = query.data?.reports ?? [];
  const configurationError = query.data?.configurationError;
  const validOptions = reviewExcelOptionsSchema.safeParse(options);
  const selectedLocale = reportLocale ?? (locale === "en" ? "en" : "it");
  const latest = reports[0];
  const active = reports.some(
    (report) => !["completed", "failed", "cancelled"].includes(report.status),
  );
  const workerFailed = Boolean(
    (generate.data?.ok && !generate.data.workerStarted) ||
    (resume.data?.ok && !resume.data.workerStarted),
  );
  const error: ReportErrorCode | null =
    configurationError ??
    (generate.data && !generate.data.ok
      ? generate.data.code
      : resume.data && !resume.data.ok
        ? resume.data.code
        : generate.isError || resume.isError || cancel.isError
          ? "PROCESSING_FAILED"
          : null) ??
    null;
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  const format = (value: string) =>
    date.format(new Date(value)).replace(/\s/g, " ");
  const range = (value: Period) =>
    `${format(value.start + "T00:00:00Z")} – ${format(value.end + "T00:00:00Z")}`;
  function row(report: ComparisonReport) {
    const pending = !["completed", "failed", "cancelled"].includes(
      report.status,
    );
    return (
      <div
        key={report.id}
        className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t py-3"
      >
        <div className="min-w-0 text-sm">
          <p className="font-medium">
            {range(report.period)}{" "}
            <span className="font-normal text-muted-foreground">
              · {report.locale.toUpperCase()} ·{" "}
              {t("version", { version: report.version })}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            <time dateTime={report.createdAt}>{format(report.createdAt)}</time>{" "}
            · {t(report.status)}
          </p>
          {report.errorCode && report.status === "failed" ? (
            <p className="mt-2 max-w-prose text-sm text-foreground">
              <CircleAlert
                className="mr-1 inline size-4 text-destructive"
                aria-hidden="true"
              />
              {t(`errors.${report.errorCode}`)}
            </p>
          ) : null}
        </div>
        {pending ? (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            {t(report.status)}
          </span>
        ) : report.status === "completed" ? (
          <a
            href={`/api/reports/${report.id}/download`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Download className="size-4" aria-hidden="true" />
            {t("download")}
          </a>
        ) : null}
      </div>
    );
  }
  return (
    <section
      aria-labelledby="powerpoint-report-title"
      className={cn(
        "min-w-0 scroll-mt-20",
        embedded
          ? "border-t border-border/60 py-5"
          : "mt-5 exoid-panel p-4 sm:p-5",
      )}
    >
      <div className="flex flex-col items-start gap-3">
        <div className="w-full min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="powerpoint-report-title"
              className="text-base font-semibold"
            >
              {t("title")}
            </h2>
          </div>
          {!embedded ? (
            <>
              <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                {t("description")}
              </p>
              <p className="mt-1 text-sm tabular-nums">
                {range(period)} · {selectedLocale.toUpperCase()}
              </p>
            </>
          ) : null}
        </div>
        {options ? (
          <Button
            type="button"
            variant="outline"
            className={embedded ? "w-full" : undefined}
            disabled={
              !query.data ||
              !validOptions.success ||
              generate.isPending ||
              active ||
              !ready ||
              Boolean(configurationError) ||
              query.isError
            }
            onClick={() => {
              resume.reset();
              generate.mutate({
                analysisId,
                expectedVersion: version,
                period,
                locale: selectedLocale,
                options,
                ...(snapshotId ? { snapshotId } : {}),
              });
            }}
          >
            {generate.isPending ? (
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Image
                src="/powerpoint.svg"
                alt=""
                width={20}
                height={20}
                className="size-5 shrink-0"
              />
            )}
            {t(reports.length ? "regenerate" : "generate")}
          </Button>
        ) : (
          <a
            className={cn(buttonVariants({ variant: "outline" }))}
            href={`/exports?${new URLSearchParams({ analysis: analysisId, ...Object.fromEntries(Object.entries(period).map(([key, value]) => [key, String(value)])), ...(snapshotId ? { snapshot: snapshotId } : {}) })}`}
          >
            {t("configure")}
          </a>
        )}
      </div>
      {active ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={cancel.isPending}
            onClick={() => {
              const running = reports.find(
                (report) =>
                  !["completed", "failed", "cancelled"].includes(report.status),
              );
              if (running) cancel.mutate(running.id);
            }}
          >
            {t("cancel")}
          </Button>
          <p className="max-w-prose text-xs text-muted-foreground">
            {t("cancelHint")}
          </p>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 max-w-prose text-sm text-foreground">
          <CircleAlert
            className="mr-1 inline size-4 text-destructive"
            aria-hidden="true"
          />
          {t(`errors.${error}`)}
        </p>
      ) : !ready ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {t("coverageHint")}
        </p>
      ) : null}
      {query.isError ? (
        <div
          role="alert"
          className="mt-3 flex flex-wrap items-center gap-2 text-sm text-foreground"
        >
          {t("loadError")}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void query.refetch()}
          >
            {t("retry")}
          </Button>
        </div>
      ) : null}
      {active && (workerFailed || reports.some((report) => report.stalled)) ? (
        <div role="status" className="mt-3 flex flex-wrap items-center gap-3">
          <p className="max-w-prose text-sm">{t("stalled")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={resume.isPending}
            onClick={() => resume.mutate()}
          >
            <RotateCw className="size-4" aria-hidden="true" />
            {t("resume")}
          </Button>
        </div>
      ) : null}
      {latest ? (
        <div className="mt-4" aria-live="polite" aria-busy={active}>
          {row(latest)}
          {latest.version !== version ||
          latest.period.start !== period.start ||
          latest.period.end !== period.end ? (
            <p className="text-xs text-muted-foreground">{t("scopeChanged")}</p>
          ) : null}
        </div>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">{t("draftHint")}</p>
      {reports.length > 1 ? (
        <details className="mt-4 border-t pt-3">
          <summary className="cursor-pointer rounded-sm text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">
            {t("history", { count: reports.length - 1 })}
          </summary>
          <div className="mt-2">{reports.slice(1).map(row)}</div>
        </details>
      ) : null}
    </section>
  );
}
