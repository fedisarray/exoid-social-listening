"use client";

import { useLocale, useTranslations } from "next-intl";
import type { RatingBreakdown } from "../schemas/ratingBreakdown";

export function RatingDistribution({
  counts,
  ratedCount,
}: {
  counts: RatingBreakdown;
  ratedCount: number;
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const number = new Intl.NumberFormat(locale);
  const percent = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
  });

  return (
    <section className="min-w-0" aria-label={t("ratingDistribution")}>
      <h4 className="text-sm font-semibold">{t("ratingDistribution")}</h4>
      {ratedCount > 0 ? (
        <>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("ratingBasis", { count: number.format(ratedCount) })}
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            {(["5", "4", "3", "2", "1"] as const).map((stars) => {
              const count = counts[stars];
              const share = count / ratedCount;
              return (
                <div
                  key={stars}
                  className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-3"
                >
                  <dt>{t("starCount", { count: Number(stars) })}</dt>
                  <dd className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-2 overflow-hidden rounded-full bg-muted"
                    >
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${share * 100}%` }}
                      />
                    </span>
                    <span className="min-w-24 text-right tabular-nums">
                      {number.format(count)}{" "}
                      <span className="text-muted-foreground">
                        ({percent.format(share)})
                      </span>
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          {t("noRatedReviews")}
        </p>
      )}
    </section>
  );
}
