"use client";

import { Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function SharedReviewRating({ rating }: { rating: number | null }) {
  const locale = useLocale();
  const t = useTranslations("reviews");
  if (rating === null) {
    return (
      <span className="text-xs text-muted-foreground">{t("unavailable")}</span>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex gap-0.5",
          rating >= 4
            ? "text-metric-positive"
            : rating < 3
              ? "text-metric-negative"
              : "text-primary",
        )}
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <span key={index} className="relative size-3.5">
            <Star className="absolute size-3.5 text-border" />
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{
                width: `${Math.min(1, Math.max(0, rating - index)) * 100}%`,
              }}
            >
              <Star className="size-3.5 fill-current" />
            </span>
          </span>
        ))}
      </span>
      <span className="text-xs font-medium tabular-nums text-foreground">
        {new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(
          rating,
        )}{" "}
        / 5
      </span>
    </span>
  );
}
