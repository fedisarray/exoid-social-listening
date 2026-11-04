"use client";

import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";

export function ReviewIndicators({
  data,
  role,
}: {
  data: ReviewDashboard;
  role: string;
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const columns = [
    "ratingChange",
    "lowRatingShare",
    "volumeChange",
    "competitorGap",
    "sharedReviewerGap",
  ] as const;
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  const number = (value: number | null, percent: boolean, signed: boolean) =>
    value === null
      ? t("unavailable")
      : new Intl.NumberFormat(locale, {
          minimumFractionDigits: percent ? 1 : 2,
          maximumFractionDigits: percent ? 1 : 2,
          signDisplay: signed ? "exceptZero" : "auto",
        }).format(value) + (percent ? "%" : "");
  const primary = data.coverage.find((place) => place.role === "primary");
  return (
    <section className="mt-6 min-w-0" aria-label={t("indicators")}>
      <h3 className="text-lg font-semibold">{t("indicators")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("indicatorsHint", {
          start: date.format(
            new Date(`${data.indicators.previousPeriod.start}T00:00:00Z`),
          ),
          end: date.format(
            new Date(`${data.indicators.previousPeriod.end}T00:00:00Z`),
          ),
          primary: primary?.label ?? "—",
        })}
      </p>
      <div
        className="mt-3 overflow-x-auto rounded-xl border bg-card focus-visible:outline-2 focus-visible:outline-ring"
        role="region"
        tabIndex={0}
        aria-label={t("indicators")}
      >
        <table className="w-full text-sm">
          <caption className="sr-only">{t("indicators")}</caption>
          <thead className="border-b bg-muted/40 text-muted-foreground">
            <tr>
              <th
                scope="col"
                className="min-w-48 px-4 py-3 text-left font-medium"
              >
                {t("property")}
              </th>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="min-w-32 px-4 py-3 text-right font-medium"
                >
                  {t(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.coverage
              .filter((place) => role === "all" || role === place.role)
              .map((place) => {
                const row = data.indicators.properties.find(
                  (item) => item.listingId === place.listingId,
                );
                return (
                  <tr key={place.listingId}>
                    <th scope="row" className="px-4 py-3 text-left font-medium">
                      {place.label}
                    </th>
                    {columns.map((column) => {
                      const value =
                        (column === "competitorGap" ||
                          column === "sharedReviewerGap") &&
                        place.role !== "competitor"
                          ? null
                          : (row?.[column] ?? null);
                      const signed = column !== "lowRatingShare";
                      return (
                        <td
                          key={column}
                          className={cn(
                            "px-4 py-3 text-right tabular-nums",
                            signed &&
                              value !== null &&
                              value < 0 &&
                              "text-metric-negative",
                            signed &&
                              value !== null &&
                              value > 0 &&
                              "text-metric-positive",
                          )}
                        >
                          {number(
                            value,
                            column === "lowRatingShare" ||
                              column === "volumeChange",
                            signed,
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {t("indicatorsMethod")}
      </p>
    </section>
  );
}
