"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { comparisonTrendWindows } from "../domain/comparisonTrendWindows";
import type { Period } from "@/features/_shared/schemas/period";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
import { ComparisonTrendSection } from "./ComparisonTrendSection";

export function ComparisonTrends({
  period,
  role,
  data,
}: {
  period: Period;
  role: string;
  data: ReviewDashboard;
}) {
  const t = useTranslations("reviews");
  const places = data.coverage.filter((p) => role === "all" || p.role === role);
  const properties = places.filter((p) => p.role !== "anchor");
  const anchors = places.filter((p) => p.role === "anchor");
  const windows = comparisonTrendWindows(data, period);
  const annual = windows.annual.map((w) => ({
    ...w,
    label: w.id === "l12m" ? t("trendRollingLabel") : w.id,
  }));
  const quarters = windows.quarters.map((w) => ({
    ...w,
    label: `Q${period.quarter} ${w.id}`,
  }));
  const groups = [
    {
      id: "properties",
      title: t("trendProperties"),
      places: properties,
      windows: annual,
      defaultWindow: "l12m",
      sections: [
        { id: "volume", title: t("trendVolume"), metric: "reviews" as const },
        { id: "rating", title: t("rating"), metric: "rating" as const },
        {
          id: "satisfaction",
          title: t("satisfied"),
          metric: "satisfaction" as const,
        },
      ],
    },
    {
      id: "quarters",
      title: t("trendQuarterly"),
      places: properties,
      windows: quarters,
      defaultWindow: String(period.year),
      sections: [
        {
          id: "quarter-rating",
          title: t("trendQuarterRating"),
          metric: "rating" as const,
        },
        {
          id: "quarter-satisfaction",
          title: t("trendQuarterSatisfaction"),
          metric: "satisfaction" as const,
        },
      ],
    },
    ...(data.coverage.some((p) => p.role === "anchor")
      ? [
          {
            id: "anchors",
            title: t("trendAnchors"),
            places: anchors,
            windows: annual,
            defaultWindow: "l12m",
            sections: [
              {
                id: "anchor-rating",
                title: t("trendAnchorRating"),
                metric: "rating" as const,
              },
              {
                id: "anchor-satisfaction",
                title: t("trendAnchorSatisfaction"),
                metric: "satisfaction" as const,
              },
            ],
          },
        ]
      : []),
  ];
  return (
    <div className="mt-8 space-y-10">
      {groups.map((group) => (
        <section
          key={group.id}
          aria-labelledby={`trend-group-${group.id}`}
          className="space-y-4"
        >
          <h3 id={`trend-group-${group.id}`} className="text-lg font-semibold">
            {group.title}
          </h3>
          {group.id === "quarters" && period.kind !== "quarter" ? (
            <p className="text-sm text-muted-foreground">
              {t("trendSelectQuarter")}
            </p>
          ) : (
            <div
              className={cn(
                "grid gap-4 xl:grid-cols-2",
                group.sections.length === 3 && "2xl:grid-cols-3",
              )}
            >
              {group.sections.map((s) => (
                <ComparisonTrendSection
                  key={s.id}
                  {...s}
                  places={group.places}
                  windows={group.windows}
                  defaultWindow={group.defaultWindow}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
