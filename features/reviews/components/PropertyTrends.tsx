"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Period } from "@/features/_shared/schemas/period";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
import {
  comparisonTrendWindows,
  type TrendWindow,
} from "../domain/comparisonTrendWindows";
import { PropertyRatingChart } from "./PropertyRatingChart";

export function PropertyTrends({
  data,
  period,
}: {
  data: ReviewDashboard;
  period: Period;
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const metrics = data.metrics;
  if (!metrics) return null;
  const windows = comparisonTrendWindows(data, period);
  const annual = windows.annual.filter((window) => window.id !== "l12m");
  const rolling = windows.annual.find((window) => window.id === "l12m");
  const indicator = data.indicators.properties[0];
  const number = (value: number | null | undefined, digits = 0) =>
    value == null
      ? "—"
      : new Intl.NumberFormat(locale, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        }).format(value);
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  const range = (start: string, end: string) =>
    date
      .formatRange(new Date(`${start}T00:00:00Z`), new Date(`${end}T00:00:00Z`))
      .replace(/\s/g, " ");
  const month = (bucket: string) =>
    new Intl.DateTimeFormat(locale, {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${bucket}-01T00:00:00Z`));
  function history(
    title: string,
    rows: TrendWindow[],
    hint = t("propertyHistoryHint"),
  ) {
    return (
      <section className="min-w-0 rounded-xl border bg-card" aria-label={title}>
        <div className="border-b px-5 py-4 sm:px-6">
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {hint}
          </p>
        </div>
        <div
          className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring"
          tabIndex={0}
          role="region"
          aria-label={title}
        >
          <table className="w-full min-w-[420px] text-sm">
            <caption className="sr-only">{title}</caption>
            <thead className="bg-muted/20 text-xs text-muted-foreground">
              <tr>
                {[t("bucket"), t("reviews"), t("rating"), t("satisfied")].map(
                  (label) => (
                    <th
                      key={label}
                      scope="col"
                      className="px-5 py-3 text-right font-medium first:text-left sm:px-6"
                    >
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((window) => {
                const row = window.rows[0];
                return (
                  <tr key={window.id}>
                    <th
                      scope="row"
                      className="px-5 py-4 text-left font-medium sm:px-6"
                    >
                      {window.id}
                      <span className="mt-1 block whitespace-nowrap text-xs font-normal text-muted-foreground">
                        {range(window.start, window.end)}
                      </span>
                    </th>
                    <td className="px-5 py-4 text-right tabular-nums sm:px-6">
                      {number(row?.reviews)}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums sm:px-6">
                      <span className="font-semibold">
                        {number(row?.rating, 2)}
                      </span>
                      <span className="mt-1 block whitespace-nowrap text-xs text-muted-foreground">
                        {row
                          ? t("ratingBasis", { count: number(row.ratedCount) })
                          : t("unavailable")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums sm:px-6">
                      {number(row?.satisfaction, 1)}
                      {row?.satisfaction != null ? "%" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!rows.length ? (
          <p className="p-5 text-sm text-muted-foreground">
            {t("noWindowData")}
          </p>
        ) : null}
      </section>
    );
  }
  return (
    <div className="mt-6 min-w-0 space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {t("propertyTrendsTitle")}
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {t("propertyTrendsHint")}
        </p>
      </div>
      <section
        className="min-w-0 rounded-xl border bg-card p-5 sm:p-6"
        aria-label={t("monthly")}
      >
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-semibold">{t("monthly")}</h3>
          <p className="text-xs tabular-nums text-muted-foreground">
            {range(period.start, period.end)} · UTC
          </p>
        </div>
        {!data.comparisonReady ? (
          <p className="mb-5 rounded-lg bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {t("partialPropertyMetrics")}
          </p>
        ) : null}
        <PropertyRatingChart
          points={metrics.monthly}
          height={280}
          className="mt-0 border-t-0 pt-0 [&>figcaption]:sr-only"
        />
        <details className="mt-5 border-t pt-4">
          <summary className="cursor-pointer text-sm font-medium">
            {t("propertyMonthlyDetails")}
          </summary>
          <div
            className="mt-4 max-h-80 overflow-auto focus-visible:outline-2 focus-visible:outline-ring"
            tabIndex={0}
            role="region"
            aria-label={t("propertyMonthlyDetails")}
          >
            <table className="w-full min-w-[520px] text-sm">
              <caption className="sr-only">{t("monthly")}</caption>
              <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
                <tr>
                  {[
                    t("bucket"),
                    t("reviews"),
                    t("rating"),
                    t("satisfied"),
                    t("ratedReviews"),
                  ].map((label) => (
                    <th
                      key={label}
                      scope="col"
                      className="border-b px-3 py-3 text-right font-medium first:text-left"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {metrics.monthly.map((row) => (
                  <tr key={row.bucket}>
                    <th scope="row" className="px-3 py-3 text-left font-medium">
                      {month(row.bucket)}
                    </th>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {number(row.reviews)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {number(row.rating, 2)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {number(row.satisfaction, 1)}
                      {row.satisfaction !== null ? "%" : ""}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {number(row.ratedCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!metrics.monthly.length ? (
              <p className="py-4 text-sm text-muted-foreground">
                {t("noWindowData")}
              </p>
            ) : null}
          </div>
        </details>
      </section>
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {history(t("annual"), annual)}
        <section
          className="min-w-0 rounded-xl border bg-card p-5 sm:p-6"
          aria-label={t("rolling")}
        >
          <h3 className="font-semibold">{t("rolling")}</h3>
          <p className="mt-2 text-xs tabular-nums text-muted-foreground">
            {rolling ? range(rolling.start, rolling.end) : "—"} · UTC
          </p>
          <dl className="mt-5 divide-y">
            {[
              { label: t("reviews"), value: number(rolling?.rows[0]?.reviews) },
              {
                label: t("rating"),
                value: number(rolling?.rows[0]?.rating, 2),
              },
              {
                label: t("satisfied"),
                value:
                  rolling?.rows[0]?.satisfaction == null
                    ? "—"
                    : `${number(rolling.rows[0].satisfaction, 1)}%`,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-baseline justify-between gap-4 py-3 first:pt-0"
              >
                <dt className="text-sm text-muted-foreground">{item.label}</dt>
                <dd className="text-lg font-semibold tabular-nums">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {rolling?.rows[0]
              ? t("ratingBasis", { count: number(rolling.rows[0].ratedCount) })
              : t("noWindowData")}
          </p>
        </section>
      </div>
      {period.kind === "quarter"
        ? history(
            `${t("quarters")} · Q${period.quarter}`,
            windows.quarters,
            t("propertyQuarterHint"),
          )
        : null}
      <section
        className="rounded-xl border bg-card p-5 sm:p-6"
        aria-label={t("propertyPeriodChanges")}
      >
        <h3 className="font-semibold">{t("propertyPeriodChanges")}</h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {t("propertyPreviousPeriod", {
            range: range(
              data.indicators.previousPeriod.start,
              data.indicators.previousPeriod.end,
            ),
          })}
        </p>
        <dl className="mt-5 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {(["ratingChange", "lowRatingShare", "volumeChange"] as const).map(
            (key) => {
              const value = indicator?.[key];
              const signed = key !== "lowRatingShare";
              const Icon =
                value == null || value === 0 || !signed
                  ? Minus
                  : value > 0
                    ? ArrowUpRight
                    : ArrowDownRight;
              return (
                <div key={key} className="min-w-0">
                  <dt className="text-sm text-muted-foreground">{t(key)}</dt>
                  <dd className="mt-2 flex items-center gap-2 text-lg font-semibold tabular-nums">
                    <Icon
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    {value == null
                      ? "—"
                      : new Intl.NumberFormat(locale, {
                          minimumFractionDigits: key === "ratingChange" ? 2 : 1,
                          maximumFractionDigits: key === "ratingChange" ? 2 : 1,
                          signDisplay: signed ? "exceptZero" : "auto",
                        }).format(value)}
                    {value != null && key !== "ratingChange" ? "%" : ""}
                  </dd>
                  {value == null ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("unavailable")}
                    </p>
                  ) : null}
                </div>
              );
            },
          )}
        </dl>
        <p className="mt-5 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
          {t("propertyChangesMethod")}
        </p>
      </section>
    </div>
  );
}
