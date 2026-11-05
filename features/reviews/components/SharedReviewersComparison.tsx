"use client";

import { SharedReviewerEvidence } from "./SharedReviewerEvidence";
import type { GetReviewDashboardInput } from "../schemas/getReviewDashboardInput";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { SharedReviewRating } from "./SharedReviewRating";
import { ListingThumbnail } from "@/features/_shared/components/ListingThumbnail";
import type { Selection } from "@/features/analyses/schemas/analysisConfig";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
import { cn } from "@/lib/utils";

type Metrics = NonNullable<ReviewDashboard["metrics"]>;

export function SharedReviewersComparison({
  metrics,
  listings,
  role,
  input,
  datasetKey,
}: {
  metrics: Metrics;
  listings: Selection[];
  role: string;
  input: GetReviewDashboardInput;
  datasetKey: string;
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
        <div className="mt-4 overflow-hidden exoid-panel">
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
                  className="grid min-w-0 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_11rem] lg:items-center lg:gap-6"
                >
                  <div className="flex min-w-0 items-center gap-3 sm:col-span-2 lg:col-span-1">
                    <ListingThumbnail
                      listing={listings.find(
                        (listing) => listing.sourceId === row.listingId,
                      )}
                      className="size-10 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-semibold">
                        {property?.label ?? row.listingId}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="size-3.5" aria-hidden="true" />
                        <span className="font-semibold tabular-nums text-foreground">
                          {number(row.shared)}
                        </span>
                        {t("sharedCount")}
                      </p>
                    </div>
                  </div>
                  {[
                    {
                      label: primary?.label ?? "—",
                      share: row.primaryShare,
                      total: row.primaryReviewers,
                      rating: row.primaryRating,
                    },
                    {
                      label: property?.label ?? row.listingId,
                      share: row.competitorShare,
                      total: row.competitorReviewers,
                      rating: row.competitorRating,
                    },
                  ].map((item, index) => (
                    <div key={index} className="min-w-0 space-y-1.5">
                      <p className="break-words text-xs font-medium text-muted-foreground">
                        {item.label}
                      </p>
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-sm font-semibold tabular-nums">
                          {number(item.share, 1)}
                          {item.share === null ? "" : "%"}
                        </span>
                        <span
                          className="text-xs tabular-nums text-muted-foreground"
                          title={t("sharedFraction", {
                            shared: number(row.shared),
                            total: number(item.total),
                          })}
                        >
                          {number(row.shared)} / {number(item.total)}
                        </span>
                      </div>
                      <SharedReviewRating rating={item.rating} />
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 lg:col-span-1 lg:flex-col lg:items-end">
                    <p
                      className="text-xs text-muted-foreground"
                      title={t("gapDirection")}
                    >
                      {t("sharedGapShort")}{" "}
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          gap !== null && gap < 0 && "text-metric-negative",
                          gap !== null && gap > 0 && "text-metric-positive",
                        )}
                      >
                        {gap === null
                          ? "—"
                          : new Intl.NumberFormat(locale, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                              signDisplay: "exceptZero",
                            }).format(gap)}
                      </span>
                    </p>
                    {input.analysisId &&
                    row.shared !== null &&
                    row.shared > 0 ? (
                      <div>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Users aria-hidden="true" />
                              {t("sharedEvidenceOpen", { count: row.shared })}
                              <ArrowUpRight aria-hidden="true" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent
                            showCloseButton={false}
                            className="w-full gap-0 sm:max-w-4xl"
                          >
                            <SheetHeader className="shrink-0 border-b p-5 pr-16 sm:p-6 sm:pr-16">
                              <SheetTitle>
                                {t("sharedEvidenceTitle")}
                              </SheetTitle>
                              <SheetDescription className="break-words">
                                {primary?.label ?? "—"} ·{" "}
                                {property?.label ?? row.listingId}
                              </SheetDescription>
                            </SheetHeader>
                            <SheetClose asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-4"
                                aria-label={t("sharedEvidenceClose")}
                              >
                                <X aria-hidden="true" />
                              </Button>
                            </SheetClose>
                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 sm:px-6">
                              <SharedReviewerEvidence
                                key={JSON.stringify([
                                  input,
                                  row.listingId,
                                  datasetKey,
                                ])}
                                input={{
                                  analysisId: input.analysisId,
                                  snapshotId: input.snapshotId,
                                  period: input.period,
                                  competitorId: row.listingId,
                                  offset: 0,
                                }}
                                primaryLabel={primary?.label ?? "—"}
                                competitorLabel={
                                  property?.label ?? row.listingId
                                }
                                datasetKey={datasetKey}
                              />
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                    ) : null}
                  </div>
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
      <details className="mt-5 exoid-panel px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium">
          {t("sharedMethod")}
        </summary>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {t("sharedNote")} {t("gapDirection")}
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
