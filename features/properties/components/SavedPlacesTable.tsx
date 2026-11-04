"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingThumbnail } from "@/features/_shared/components/ListingThumbnail";
import type { PropertySummary } from "../schemas/listPropertiesOutput";

export function SavedPlacesTable({
  properties,
  onDelete,
}: {
  properties: PropertySummary[];
  onDelete: (property: PropertySummary, trigger: HTMLButtonElement) => void;
}) {
  const t = useTranslations("properties");
  const format = useFormatter();
  const router = useRouter();
  return (
    <div
      className="mt-6 overflow-x-auto rounded-xl border bg-card focus-visible:outline-2 focus-visible:outline-ring"
      role="region"
      aria-label={t("saved")}
      tabIndex={0}
    >
      <table className="w-full min-w-[960px] text-sm">
        <caption className="sr-only">{t("saved")}</caption>
        <thead className="border-b bg-muted/40 text-muted-foreground">
          <tr>
            {[
              "placeColumn",
              "reviewsColumn",
              "ratingColumn",
              "commentsColumn",
              "coverageColumn",
              "collectedColumn",
              "actionsColumn",
            ].map((key) => (
              <th
                key={key}
                scope="col"
                className="px-4 py-3 text-left font-medium"
              >
                {t(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {properties.map((property) => (
            <tr
              key={property.id}
              className="cursor-pointer hover:bg-muted/30"
              onClick={(event) => {
                if (
                  event.target instanceof Element &&
                  event.target.closest("a, button")
                )
                  return;
                router.push(`/properties/${property.id}`);
              }}
            >
              <th
                scope="row"
                className="min-w-64 px-4 py-4 text-left font-normal"
              >
                <div className="flex items-center gap-3">
                  <ListingThumbnail
                    listing={property.listing}
                    className="size-10"
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/properties/${property.id}`}
                      className="font-semibold underline-offset-4 hover:underline"
                    >
                      {property.listing.name}
                    </Link>
                    <p className="mt-1 max-w-80 text-xs text-muted-foreground">
                      {property.listing.address}
                    </p>
                  </div>
                </div>
              </th>
              <td className="px-4 py-4 tabular-nums">
                {property.reviews === null
                  ? "—"
                  : format.number(property.reviews)}
              </td>
              <td className="whitespace-nowrap px-4 py-4 tabular-nums">
                {property.rating === null
                  ? "—"
                  : `${format.number(property.rating, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / 5`}
              </td>
              <td className="px-4 py-4 tabular-nums">
                {property.textReviews === null
                  ? "—"
                  : format.number(property.textReviews)}
              </td>
              <td className="min-w-48 px-4 py-4 text-xs tabular-nums">
                {property.covered.length ? (
                  property.covered.map((interval) => (
                    <p
                      key={`${interval.start}-${interval.end}`}
                      className="whitespace-nowrap"
                    >
                      {interval.start} — {interval.end}
                    </p>
                  ))
                ) : (
                  <span className="text-muted-foreground">
                    {t("unverifiedCoverage")}
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-xs">
                {property.collectedAt
                  ? format.dateTime(new Date(property.collectedAt), {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })
                  : t("notCollected")}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-1">
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/properties/${property.id}${property.reviews === null ? "?collect=1" : ""}`}
                    >
                      {t(property.reviews === null ? "collect" : "open")}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t("deleteNamed", {
                      name: property.listing.name,
                    })}
                    onClick={(event) => onDelete(property, event.currentTarget)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
