"use client";

import { useLocale, useTranslations } from "next-intl";
import { Globe, Phone, Star } from "lucide-react";
import type { Listing } from "../schemas/listing";

export function ListingDetails({
  listing,
  showReviews = true,
}: {
  listing: Listing;
  showReviews?: boolean;
}) {
  const t = useTranslations("app");
  const locale = useLocale();
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  return (
    <div className="mt-2 space-y-2 text-sm text-muted-foreground">
      {listing.categories?.length ? (
        <p className="break-words">
          <span className="sr-only">{t("placeType")}: </span>
          {listing.categories.join(" · ")}
        </p>
      ) : null}
      {showReviews ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 tabular-nums">
          {listing.googleMapsRating !== undefined ? (
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5" aria-hidden="true" />
              {t("mapsRating", {
                rating: number.format(listing.googleMapsRating),
              })}
            </span>
          ) : null}
          <span>
            {listing.googleMapsReviews
              ? t("mapsReviewCount", {
                  count: number.format(listing.googleMapsReviews.count),
                })
              : t("mapsReviewCountUnavailable")}
          </span>
        </p>
      ) : null}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {listing.website ? (
          <a
            href={listing.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary underline underline-offset-4"
          >
            <Globe className="size-3.5" aria-hidden="true" />
            {t("placeWebsite")}
          </a>
        ) : null}
        {listing.phone ? (
          <span className="inline-flex min-w-0 items-center gap-1">
            <Phone className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="break-words">{listing.phone}</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
