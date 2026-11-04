"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RatingTrendPoint } from "../schemas/ratingTrendPoint";

export function PropertyRatingChart({
  points,
  className,
  emptyLabel,
  height = 176,
}: {
  points: RatingTrendPoint[];
  className?: string;
  emptyLabel?: string;
  height?: number;
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const data = useMemo(() => {
    const sorted = points.toSorted((a, b) => a.bucket.localeCompare(b.bucket));
    if (sorted.length === 0) return [];
    const byMonth = new Map(sorted.map((point) => [point.bucket, point]));
    const result: RatingTrendPoint[] = [];
    const month = new Date(`${sorted[0].bucket}-01T00:00:00Z`);
    const end = sorted[sorted.length - 1].bucket;
    while (month.toISOString().slice(0, 7) <= end) {
      const bucket = month.toISOString().slice(0, 7);
      result.push(
        byMonth.get(bucket) ?? {
          bucket,
          rating: null,
          ratedCount: 0,
          reviews: 0,
        },
      );
      month.setUTCMonth(month.getUTCMonth() + 1);
    }
    return result;
  }, [points]);
  const date = (bucket: string) =>
    new Intl.DateTimeFormat(locale, {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    }).format(new Date(`${bucket}-01T00:00:00Z`));
  const number = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const count = new Intl.NumberFormat(locale);

  return (
    <figure className={cn("min-w-0 self-start mt-4 border-t pt-4", className)}>
      <figcaption className="text-sm text-muted-foreground">
        {t("reviewsRatingTrend")}
      </figcaption>
      {data.some((point) => point.reviews > 0 || point.rating !== null) ? (
        <>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-sm bg-chart-1"
              />
              {t("reviewCountAxis")}
            </span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="h-0.5 w-3 bg-chart-2" />
              {t("ratingAxis")}
            </span>
          </div>
          <div
            className="mt-3 min-w-0 overflow-hidden text-xs"
            style={{ height }}
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart
                data={data}
                margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  yAxisId="reviews"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={date}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                  interval="preserveStartEnd"
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  yAxisId="reviews"
                  width={36}
                  domain={[0, "auto"]}
                  allowDecimals={false}
                  tickFormatter={(value) => count.format(Number(value))}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  yAxisId="rating"
                  orientation="right"
                  width={24}
                  domain={[1, 5]}
                  ticks={[1, 3, 5]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  labelFormatter={(bucket) => date(String(bucket))}
                  formatter={(value, name, item) => {
                    if (name === "reviews")
                      return [count.format(Number(value)), t("scopedReviews")];
                    const point = data.find(
                      (point) => point.bucket === item.payload.bucket,
                    );
                    return [
                      number.format(Number(value)),
                      `${t("rating")} · ${t("ratingBasis", {
                        count: new Intl.NumberFormat(locale).format(
                          point?.ratedCount ?? 0,
                        ),
                      })}`,
                    ];
                  }}
                  contentStyle={{
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    whiteSpace: "normal",
                    maxWidth: 240,
                  }}
                />
                <Bar
                  yAxisId="reviews"
                  dataKey="reviews"
                  fill="var(--chart-1)"
                  maxBarSize={24}
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="rating"
                  type="linear"
                  dataKey="rating"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={{ r: 2, fill: "var(--chart-2)" }}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="sr-only">
            <table>
              <caption>{t("reviewsRatingTrend")}</caption>
              <thead>
                <tr>
                  <th>{t("bucket")}</th>
                  <th>{t("scopedReviews")}</th>
                  <th>{t("rating")}</th>
                  <th>{t("rated")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((point) => (
                  <tr key={point.bucket}>
                    <th scope="row">{date(point.bucket)}</th>
                    <td>{count.format(point.reviews)}</td>
                    <td>
                      {point.rating === null
                        ? t("unavailable")
                        : number.format(point.rating)}
                    </td>
                    <td>
                      {new Intl.NumberFormat(locale).format(point.ratedCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="mt-3 flex min-h-44 items-center justify-center rounded-lg bg-muted/30 px-4 text-center text-sm text-muted-foreground">
          {emptyLabel ?? t("noReviewTrend")}
        </p>
      )}
    </figure>
  );
}
