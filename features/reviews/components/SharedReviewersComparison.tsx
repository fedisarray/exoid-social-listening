"use client";

import { useLocale, useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { ListingThumbnail } from "@/features/_shared/components/ListingThumbnail";
import type { Selection } from "@/features/analyses/schemas/analysisConfig";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
import { cn } from "@/lib/utils";

type Metrics = NonNullable<ReviewDashboard["metrics"]>;

export function SharedReviewersComparison({
  metrics,
  listings,
  role,
}: {
  metrics: Metrics;
  listings: Selection[];
  role: string;
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const primary = metrics.properties.find(
    (property) => property.role === "primary",
  );
  const properties = metrics.properties.filter(
    (property) => role === "all" || property.role === role,
  );
  const rows = metrics.shared.filter((row) =>
    properties.some((property) => property.listingId === row.listingId),
  );
  const number = (value: number | null, digits = 0) =>
    value === null
      ? "—"
      : new Intl.NumberFormat(locale, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        }).format(value);
  return (
    <section className="mt-6 min-w-0" aria-label={t("shared")}>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t("sharedComparisonHint", { primary: primary?.label ?? "—" })}
      </p>
      {rows.length ? (
        <div className="mt-4 overflow-hidden rounded-xl border bg-card">
          <div
            className="hidden gap-6 border-b bg-muted/30 px-5 py-3 text-xs font-medium text-muted-foreground lg:grid lg:grid-cols-[minmax(0,1.1fr)_6rem_minmax(0,1.8fr)_minmax(0,1fr)]"
            aria-hidden="true"
          >
            <span>{t("property")}</span>
            <span>{t("sharedCount")}</span>
            <span>{t("sharedDirection")}</span>
            <span>{t("sharedRatings")}</span>
          </div>
          <div className="divide-y">
            {rows.map((row) => {
              const gap =
                row.primaryRating !== null && row.competitorRating !== null
                  ? row.primaryRating - row.competitorRating
                  : null;
              const property = metrics.properties.find(
                (item) => item.listingId === row.listingId,
              );
              return (
                <article
                  key={row.listingId}
                  aria-label={property?.label ?? row.listingId}
                  className="grid min-w-0 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.1fr)_6rem_minmax(0,1.8fr)_minmax(0,1fr)] lg:items-start lg:gap-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ListingThumbnail
                      listing={listings.find(
                        (listing) => listing.sourceId === row.listingId,
                      )}
                      className="size-10 shrink-0"
                    />
                    <h3 className="min-w-0 break-words text-sm font-semibold">
                      {property?.label ?? row.listingId}
                    </h3>
                  </div>
                  <dl className="sm:text-right lg:text-left">
                    <dt className="text-xs text-muted-foreground lg:sr-only">
                      {t("sharedCount")}
                    </dt>
                    <dd className="mt-1 flex items-center gap-2 text-2xl font-semibold tabular-nums sm:justify-end lg:mt-0 lg:justify-start">
                      <Users
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      {number(row.shared)}
                    </dd>
                  </dl>
                  <div className="min-w-0 space-y-4">
                    {[
                      {
                        label: primary?.label ?? "—",
                        share: row.primaryShare,
                        total: row.primaryReviewers,
                        own: true,
                      },
                      {
                        label: property?.label ?? row.listingId,
                        share: row.competitorShare,
                        total: row.competitorReviewers,
                        own: false,
                      },
                    ].map((direction) => (
                      <div key={String(direction.own)}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="min-w-0 break-words">
                            {direction.label}
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums">
                            {number(direction.share, 1)}
                            {direction.share !== null ? "%" : ""}
                          </span>
                        </div>
                        <div
                          className="mt-1.5 h-2 overflow-hidden rounded-sm bg-muted"
                          aria-hidden="true"
                        >
                          <div
                            className={cn(
                              "h-full rounded-sm",
                              direction.own ? "bg-primary" : "bg-chart-2",
                            )}
                            style={{
                              width: `${direction.share === null ? 0 : Math.min(100, Math.max(0, direction.share))}%`,
                            }}
                          />
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {direction.share === null
                            ? t("unavailable")
                            : t("sharedFraction", {
                                shared: number(row.shared),
                                total: number(direction.total),
                              })}
                        </p>
                      </div>
                    ))}
                  </div>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        {t("sharedReviewerGap")}
                      </dt>
                      <dd
                        className={cn(
                          "mt-1 text-sm font-semibold tabular-nums",
                          gap !== null && gap < 0 && "text-metric-negative",
                          gap !== null && gap > 0 && "text-metric-positive",
                        )}
                      >
                        {gap !== null
                          ? new Intl.NumberFormat(locale, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                              signDisplay: "exceptZero",
                            }).format(gap)
                          : t("unavailable")}
                      </dd>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("gapDirection")}
                      </p>
                    </div>
                    {[
                      {
                        label: primary?.label ?? "—",
                        rating: row.primaryRating,
                      },
                      {
                        label: property?.label ?? row.listingId,
                        rating: row.competitorRating,
                      },
                    ].map((item, index) => (
                      <div key={index}>
                        <dt className="text-xs leading-relaxed text-muted-foreground">
                          {t("sharedRatingFor", { property: item.label })}
                        </dt>
                        <dd className="mt-1 text-sm font-semibold tabular-nums">
                          {number(item.rating, 2)}
                          {item.rating !== null ? (
                            <span className="font-normal text-muted-foreground">
                              {" "}
                              / 5
                            </span>
                          ) : null}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("sharedNoMatches")}
        </p>
      )}
      <details className="mt-5 rounded-lg border bg-card px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium">
          {t("sharedMethod")}
        </summary>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {t("sharedNote")}
        </p>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {t("coverage")}
        </p>
        <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {metrics.properties
            .filter(
              (property) =>
                property.role === "primary" ||
                role === "all" ||
                property.role === role,
            )
            .map((property) => (
              <div
                key={property.listingId}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <dt className="min-w-0 break-words">
                  {property.label}
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {t("identityCoverage")}
                  </span>
                </dt>
                <dd className="shrink-0 tabular-nums">
                  {number(property.identifiedReviews)} /{" "}
                  {number(property.reviews)}
                </dd>
              </div>
            ))}
        </dl>
      </details>
    </section>
  );
}
