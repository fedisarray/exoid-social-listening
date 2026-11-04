"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { PropertyRatingChart } from "./PropertyRatingChart";
import { RatingDistribution } from "./RatingDistribution";
import type { RatingBreakdown } from "../schemas/ratingBreakdown";
import type { RatingTrendPoint } from "../schemas/ratingTrendPoint";
import type { Listing } from "@/features/_shared/schemas/listing";
import { ListingThumbnail } from "@/features/_shared/components/ListingThumbnail";
import { ListingDetails } from "@/features/_shared/components/ListingDetails";
import { useLocale, useTranslations } from "next-intl";
import {
  CalendarRange,
  Clock3,
  ExternalLink,
  MapPin,
  Star,
} from "lucide-react";
import type { Selection } from "@/features/analyses/schemas/analysisConfig";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
import { sourceStatusSchema } from "../schemas/collection";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function PropertyReviewCard({
  label,
  role,
  listing,
  metric,
  status,
  loading,
  href,
  collectedAt,
  covered,
  collectionPeriod,
  ratingTrend,
  actions,
  compact = false,
  showIdentity = true,
  view = "rows",
}: {
  label: string;
  role?: string;
  listing?: Listing;
  metric?: Pick<
    NonNullable<ReviewDashboard["metrics"]>["properties"][number],
    "reviews" | "ratedCount" | "rating" | "available"
  > & { textReviews?: number; ratingBreakdown?: RatingBreakdown };
  status?: string;
  loading: boolean;
  href?: string;
  collectedAt?: string | null;
  covered?: { start: string; end: string }[];
  collectionPeriod?: { start: string; end: string } | null;
  ratingTrend?: RatingTrendPoint[];
  actions?: ReactNode;
  compact?: boolean;
  showIdentity?: boolean;
  view?: "cards" | "rows" | "small";
}) {
  const t = useTranslations("reviews");
  const app = useTranslations("app");
  const locale = useLocale();
  const available = metric?.available === true;
  const small = compact && view === "small";
  const rows = compact && view === "rows";
  const sourceStatus = sourceStatusSchema.safeParse(status);
  const number = (value: number, digits = 0) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  const commentCounts =
    available && metric.textReviews !== undefined ? (
      <>
        <div>
          <dt className="text-sm text-muted-foreground">{t("withText")}</dt>
          <dd
            className={cn(
              "font-semibold tabular-nums",
              compact ? "mt-1 text-xl" : "mt-2 text-2xl",
            )}
          >
            {number(metric.textReviews)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">{t("withoutText")}</dt>
          <dd
            className={cn(
              "font-semibold tabular-nums",
              compact ? "mt-1 text-xl" : "mt-2 text-2xl",
            )}
          >
            {number(metric.reviews - metric.textReviews)}
          </dd>
        </div>
      </>
    ) : null;
  return (
    <article
      aria-label={showIdentity ? undefined : label}
      className={cn(
        "@container min-w-0 overflow-hidden exoid-panel text-card-foreground",
        compact && "flex h-full flex-col",
        rows &&
          "xl:grid xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.1fr)_minmax(0,1.2fr)]",
        small && "xl:grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)_auto]",
      )}
    >
      {showIdentity ? (
        <div
          className={cn(
            "flex flex-wrap items-start gap-4 p-5",
            compact
              ? "min-h-36 items-center bg-muted/20 lg:min-h-28 lg:p-4"
              : "@lg:p-6",
            rows && "xl:content-start xl:items-start",
            small && "min-h-0 gap-3 p-3 lg:min-h-0 lg:p-3",
          )}
        >
          <ListingThumbnail
            listing={listing}
            className={cn(
              compact
                ? small
                  ? "size-12"
                  : "size-24 xl:size-28"
                : "size-20 @lg:size-24",
            )}
          />
          <div className="min-w-0 flex-1 self-center">
            {role ? (
              <Badge
                variant="secondary"
                className="mb-2 h-auto whitespace-normal"
              >
                {app(role as Selection["role"])}
              </Badge>
            ) : null}
            <h3
              className={cn(
                "text-lg leading-snug font-semibold break-words @lg:text-xl",
                small && "text-base @lg:text-base",
              )}
            >
              {href ? (
                <Link
                  href={href}
                  className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {label}
                </Link>
              ) : listing ? (
                <a
                  href={listing.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {label}
                  <ExternalLink
                    className="ml-1.5 inline size-3.5"
                    aria-hidden="true"
                  />
                </a>
              ) : (
                label
              )}
            </h3>
            {listing?.address ? (
              <p
                className={cn(
                  "mt-2 flex items-start gap-1.5 text-sm leading-relaxed text-muted-foreground",
                  small && "mt-1 text-xs",
                )}
              >
                <MapPin className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-words">{listing.address}</span>
              </p>
            ) : null}
            {listing && !compact ? (
              <ListingDetails listing={listing} showReviews={false} />
            ) : null}
          </div>
        </div>
      ) : null}
      <div
        className={cn(
          "grid min-w-0 gap-6 px-5 py-5",
          compact ? "lg:p-4" : "@lg:px-6",
          (rows || small) && "xl:border-t-0 xl:border-l",
          small &&
            "gap-3 p-3 lg:p-3 [&_dt]:text-xs [&_dd]:mt-1 [&_dd]:text-lg [&_dd>span:first-child]:text-lg",
          showIdentity && "border-t",
        )}
      >
        {loading ? (
          <>
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </>
        ) : (
          <>
            <div
              className={cn(
                "min-w-0",
                small &&
                  "xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-center xl:gap-4",
              )}
            >
              <dl
                className={cn(
                  "grid grid-cols-2 gap-x-4 gap-y-5 @lg:grid-cols-3",
                  compact && "grid-cols-3 gap-x-3",
                  !compact && commentCounts && "@3xl:grid-cols-5",
                )}
              >
                <div className="min-w-0">
                  <dt className="text-sm leading-snug text-muted-foreground">
                    {t("mapsTotal")}
                  </dt>
                  <dd className="mt-2 text-2xl font-semibold tabular-nums">
                    {listing?.googleMapsReviews
                      ? number(listing.googleMapsReviews.count)
                      : "—"}
                    <span
                      className={cn(
                        "mt-2 block text-xs leading-relaxed font-normal text-muted-foreground",
                        small && "sr-only",
                      )}
                    >
                      {listing?.googleMapsReviews
                        ? t("mapsChecked", {
                            date: new Intl.DateTimeFormat(locale, {
                              dateStyle: "medium",
                              timeZone: "UTC",
                            }).format(
                              new Date(listing.googleMapsReviews.checkedAt),
                            ),
                          })
                        : t("mapsUnavailable")}
                    </span>
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-sm leading-snug text-muted-foreground">
                    {t("scopedReviews")}
                  </dt>
                  <dd className="mt-2 text-2xl font-semibold tabular-nums">
                    {available ? number(metric.reviews) : "—"}
                  </dd>
                </div>
                <div
                  className={cn(
                    "col-span-2 min-w-0 @lg:col-span-1",
                    compact && "col-span-1",
                  )}
                >
                  <dt className="text-sm leading-snug text-muted-foreground">
                    {t("rating")}
                  </dt>
                  <dd className="mt-2">
                    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-2xl font-semibold tabular-nums">
                      <Star
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      {available && metric.rating !== null
                        ? number(metric.rating, 2)
                        : "—"}
                      <span className="text-xs font-normal text-muted-foreground">
                        {t("outOfFive")}
                      </span>
                    </span>
                    {available ? (
                      <span
                        className={cn(
                          "mt-2 block text-xs leading-relaxed text-muted-foreground",
                          small && "sr-only",
                        )}
                      >
                        {t("ratingBasis", { count: number(metric.ratedCount) })}
                      </span>
                    ) : null}
                  </dd>
                </div>
                {!compact ? commentCounts : null}
              </dl>
              {compact && commentCounts ? (
                <dl
                  className={cn(
                    "mt-5 grid grid-cols-2 gap-4 border-t pt-4",
                    small &&
                      "xl:mt-0 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-4",
                  )}
                >
                  {commentCounts}
                </dl>
              ) : null}
              {!available ||
              (sourceStatus.success &&
                ["partial", "failed"].includes(sourceStatus.data)) ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  {sourceStatus.success
                    ? t(sourceStatus.data)
                    : t("notCollected")}
                </p>
              ) : null}
            </div>
            {!compact &&
            (ratingTrend || (available && metric.ratingBreakdown)) ? (
              <div className="grid min-w-0 gap-6 border-t pt-6 @2xl:grid-cols-2 @2xl:gap-8">
                {available && metric.ratingBreakdown ? (
                  <RatingDistribution
                    counts={metric.ratingBreakdown}
                    ratedCount={metric.ratedCount}
                  />
                ) : null}
                {ratingTrend ? (
                  <PropertyRatingChart
                    points={ratingTrend}
                    className={cn(
                      "mt-0 border-t-0 pt-0",
                      (!available || !metric.ratingBreakdown) &&
                        "col-span-full",
                    )}
                  />
                ) : null}
              </div>
            ) : null}
            {available && !compact ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t("countScopeHint")}
              </p>
            ) : null}
          </>
        )}
      </div>
      {compact && !small && !loading ? (
        <PropertyRatingChart
          points={ratingTrend ?? []}
          emptyLabel={!available ? t("notCollected") : undefined}
          className={cn(
            "col-span-full mt-0 w-full border-t px-5 py-5 lg:p-4",
            rows && "xl:col-span-1 xl:border-t-0 xl:border-l",
          )}
        />
      ) : null}
      {collectedAt !== undefined || covered || collectionPeriod || actions ? (
        <div
          className={cn(
            "col-span-full flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t bg-muted/30 px-5 py-4",
            compact ? "lg:px-4 lg:py-3" : "@lg:px-6",
            compact && "mt-auto",
            small &&
              "px-3 py-2 lg:px-3 lg:py-2 xl:col-span-1 xl:mt-0 xl:border-t-0 xl:bg-transparent",
          )}
        >
          {!small && collectedAt !== undefined ? (
            <div className="flex min-w-0 items-start gap-2.5 text-sm">
              <Clock3
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {t("lastCollected")}
                </p>
                {collectedAt ? (
                  <time
                    dateTime={collectedAt}
                    className="mt-1 block font-medium tabular-nums"
                  >
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "UTC",
                    }).format(new Date(collectedAt))}{" "}
                    · UTC
                  </time>
                ) : (
                  <p className="mt-1 font-medium">{t("notCollected")}</p>
                )}
              </div>
            </div>
          ) : null}
          {!small && covered ? (
            <div className="min-w-0 text-sm">
              <p className="text-xs text-muted-foreground">
                {t("coveredDates")} (UTC)
              </p>
              <p className="mt-1 font-medium tabular-nums">
                {covered.length
                  ? covered
                      .map((range) => `${range.start} — ${range.end}`)
                      .join("; ")
                  : "—"}
              </p>
            </div>
          ) : !small && collectionPeriod ? (
            <div className="flex min-w-0 items-start gap-2.5 text-sm">
              <CalendarRange
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {t("collectionPeriod")}
                </p>
                <p className="mt-1 font-medium tabular-nums">
                  <time dateTime={collectionPeriod.start}>
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(`${collectionPeriod.start}T00:00:00Z`))}
                  </time>
                  {" — "}
                  <time dateTime={collectionPeriod.end}>
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(`${collectionPeriod.end}T00:00:00Z`))}
                  </time>
                </p>
              </div>
            </div>
          ) : null}
          {actions ? <div className="ml-auto shrink-0">{actions}</div> : null}
        </div>
      ) : null}
    </article>
  );
}
