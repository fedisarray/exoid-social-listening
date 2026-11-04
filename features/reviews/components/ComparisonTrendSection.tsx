"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Choice } from "@/features/_shared/components/Choice";
import { cn } from "@/lib/utils";

import type { TrendWindow } from "../domain/comparisonTrendWindows";
export type TrendPlace = { listingId: string; label: string; role: string };

export function ComparisonTrendSection({
  id,
  title,
  metric,
  places,
  windows,
  defaultWindow,
}: {
  id: string;
  title: string;
  metric: "reviews" | "rating" | "satisfaction";
  places: TrendPlace[];
  windows: (TrendWindow & { label: string })[];
  defaultWindow: string;
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const search = useSearchParams();
  const key = `trend-${id}`;
  const selected =
    windows.find((w) => w.id === search.get(key)) ??
    windows.find((w) => w.id === defaultWindow) ??
    windows[0];
  const digits = metric === "rating" ? 2 : metric === "satisfaction" ? 1 : 0;
  const number = new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  const format = (value: number | null | undefined) =>
    value == null
      ? "—"
      : `${number.format(value)}${metric === "satisfaction" ? "%" : ""}`;
  const max =
    metric === "rating"
      ? 5
      : metric === "satisfaction"
        ? 100
        : Math.max(
            1,
            ...windows.flatMap((w) =>
              w.rows
                .filter((r) => places.some((p) => p.listingId === r.listingId))
                .map((r) => r.reviews),
            ),
          );
  return (
    <section
      className="min-w-0 rounded-xl border bg-card p-4 sm:p-6"
      aria-labelledby={`${id}-title`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 id={`${id}-title`} className="font-semibold">
            {title}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {t(
              metric === "reviews"
                ? "trendCountUnit"
                : metric === "rating"
                  ? "trendRatingUnit"
                  : "trendSatisfactionUnit",
            )}
          </p>
        </div>
        <div className="w-40">
          <Choice
            label={t("trendPeriod", { title })}
            value={selected.id}
            options={windows.map((w) => ({ value: w.id, label: w.label }))}
            onChange={(value) => {
              const next = new URL(window.location.href);
              next.searchParams.set(key, value);
              window.history.replaceState(null, "", next);
            }}
          />
        </div>
      </div>
      <p className="mt-3 text-xs tabular-nums text-muted-foreground">
        {date.format(new Date(`${selected.start}T00:00:00Z`))} —{" "}
        {date.format(new Date(`${selected.end}T00:00:00Z`))} (UTC)
      </p>
      <div className="mt-5 space-y-4" aria-live="polite">
        {places.map((place) => {
          const row = selected.rows.find(
            (r) => r.listingId === place.listingId,
          );
          const value = row?.[metric];
          const own =
            place.role === "primary" || place.role === "additionalOwn";
          return (
            <div
              key={place.listingId}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[minmax(8rem,1fr)_minmax(0,2fr)_5rem]"
            >
              <span
                className={cn(
                  "min-w-0 break-words text-sm",
                  own && "font-medium",
                )}
              >
                {place.label}
              </span>
              <div
                className="col-span-2 row-start-2 h-3 overflow-hidden rounded-sm bg-muted sm:col-span-1 sm:col-start-2 sm:row-start-1"
                aria-hidden="true"
              >
                <div
                  className={cn(
                    "h-full rounded-sm",
                    own ? "bg-primary" : "bg-muted-foreground/60",
                  )}
                  style={{
                    width: `${value == null ? 0 : Math.min(100, Math.max(0, (value / max) * 100))}%`,
                  }}
                />
              </div>
              <span className="col-start-2 row-start-1 text-right text-sm tabular-nums sm:col-start-3">
                {format(value)}
              </span>
              <span className="col-span-full text-xs text-muted-foreground">
                {row
                  ? t("ratingBasis", { count: row.ratedCount })
                  : t("unavailable")}
              </span>
            </div>
          );
        })}
      </div>
      {!selected.rows.length ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("noWindowData")}
        </p>
      ) : null}
      {!places.length ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("noProperties")}
        </p>
      ) : null}
      <details className="mt-5 border-t pt-3">
        <summary className="cursor-pointer text-sm text-muted-foreground">
          {t("trendHistory")}
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="p-2 text-left font-medium">
                  {t("bucket")}
                </th>
                {places.map((p) => (
                  <th
                    key={p.listingId}
                    scope="col"
                    className="min-w-28 p-2 text-right font-medium"
                  >
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {windows.map((w) => (
                <tr key={w.id} className="border-b">
                  <th scope="row" className="p-2 text-left font-normal">
                    <span className="whitespace-nowrap">{w.label}</span>
                    <span className="mt-1 block whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                      {w.start} — {w.end}
                    </span>
                  </th>
                  {places.map((p) => (
                    <td
                      key={p.listingId}
                      className="p-2 text-right tabular-nums"
                    >
                      {format(
                        w.rows.find((r) => r.listingId === p.listingId)?.[
                          metric
                        ],
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {t("trendHistoryHint")}
        </p>
      </details>
    </section>
  );
}
