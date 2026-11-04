"use client";
import { useLocale, useTranslations } from "next-intl";
import type { Selection } from "@/features/analyses/schemas/analysisConfig";
import { ListingThumbnail } from "@/features/_shared/components/ListingThumbnail";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { MetricFacts } from "../schemas/getReviewDashboardOutput";
import { cn } from "@/lib/utils";
export function AnalysisComparisonTable({
  properties,
  loading,
}: {
  properties: {
    id: string;
    label: string;
    role: string;
    listing?: Selection;
    metric?: MetricFacts & { available: boolean };
  }[];
  loading: boolean;
}) {
  const t = useTranslations("reviews");
  const app = useTranslations("app");
  const locale = useLocale();
  const number = (value: number | null, digits = 0) =>
    value === null
      ? "—"
      : new Intl.NumberFormat(locale, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        }).format(value);
  return (
    <div
      className="mt-5 overflow-x-auto exoid-panel focus-visible:outline-2 focus-visible:outline-ring"
      tabIndex={0}
      role="region"
      aria-label={app("analysisComparison")}
      aria-busy={loading}
    >
      <table className="w-full min-w-[680px] text-sm">
        <caption className="sr-only">{app("analysisComparison")}</caption>
        <thead className="border-b bg-muted/40 text-left text-muted-foreground">
          <tr>
            {[
              t("property"),
              t("scopedReviews"),
              t("rating"),
              t("satisfied"),
              t("text"),
            ].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="px-5 py-3 text-right font-medium first:min-w-64 first:text-left"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {properties.map((property) => (
            <tr
              key={property.id}
              className={cn(property.role === "primary" && "bg-accent/30")}
            >
              <th scope="row" className="px-5 py-4 text-left font-normal">
                <div className="flex items-center gap-3">
                  <ListingThumbnail
                    listing={property.listing}
                    className="size-12"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold break-words">
                      {property.label}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-1.5 h-auto whitespace-normal"
                    >
                      {app(property.role as Selection["role"])}
                    </Badge>
                  </div>
                </div>
              </th>
              {[
                property.metric?.reviews ?? null,
                property.metric?.rating ?? null,
                property.metric?.satisfaction ?? null,
                property.metric?.textReviews ?? null,
              ].map((value, index) => (
                <td
                  key={index}
                  className="px-5 py-4 text-right align-middle tabular-nums"
                >
                  {loading ? (
                    <Skeleton className="ml-auto h-5 w-12" />
                  ) : property.metric?.available ? (
                    <>
                      <span
                        className={cn(index === 1 && "font-semibold text-base")}
                      >
                        {number(value, index === 1 ? 2 : index === 2 ? 1 : 0)}
                        {index === 1 && value !== null
                          ? " / 5"
                          : index === 2 && value !== null
                            ? "%"
                            : ""}
                      </span>
                      {index === 1 ? (
                        <span className="mt-1.5 block text-xs text-muted-foreground">
                          {t("ratingBasis", {
                            count: number(property.metric.ratedCount),
                          })}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span
                      className="text-muted-foreground"
                      aria-label={t("unavailable")}
                    >
                      —
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
