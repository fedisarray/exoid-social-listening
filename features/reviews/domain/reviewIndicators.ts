import type { Period } from "@/features/_shared/schemas/period";
import { resolvePeriod } from "@/features/_shared/domain/period";
import type {
  RawMetrics,
  ReviewIndicators,
} from "../schemas/getReviewDashboardOutput";

export function previousReviewPeriod(period: Period): Period {
  const start = new Date(`${period.start}T00:00:00Z`);
  const end = new Date(start.getTime() - 86_400_000);
  if (period.kind === "quarter") {
    return resolvePeriod({
      ...period,
      year: period.quarter === 1 ? period.year - 1 : period.year,
      quarter: period.quarter === 1 ? 4 : period.quarter - 1,
    });
  }
  if (period.kind === "l12m") {
    return resolvePeriod({ ...period, cutoff: end.toISOString().slice(0, 10) });
  }
  const duration =
    Date.parse(`${period.end}T00:00:00Z`) - start.getTime() + 86_400_000;
  return {
    ...period,
    start: new Date(start.getTime() - duration).toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    cutoff: end.toISOString().slice(0, 10),
  };
}

export function reviewIndicators(
  current: RawMetrics,
  previous: RawMetrics | null,
  previousPeriod: Period,
  primaryId: string | undefined,
  ready: boolean,
): ReviewIndicators {
  const primary = current.properties.find((p) => p.listingId === primaryId);
  return {
    previousPeriod: { start: previousPeriod.start, end: previousPeriod.end },
    properties: current.properties.map((property) => {
      const prior = previous?.properties.find(
        (p) => p.listingId === property.listingId,
      );
      const shared = current.shared.find(
        (p) => p.listingId === property.listingId,
      );
      return {
        listingId: property.listingId,
        ratingChange:
          ready && property.rating !== null && prior?.rating != null
            ? property.rating - prior.rating
            : null,
        lowRatingShare:
          ready && property.ratedCount > 0
            ? ((property.ratingBreakdown["1"] + property.ratingBreakdown["2"]) /
                property.ratedCount) *
              100
            : null,
        volumeChange:
          ready && prior && prior.reviews > 0
            ? ((property.reviews - prior.reviews) / prior.reviews) * 100
            : null,
        competitorGap:
          ready &&
          property.listingId !== primaryId &&
          primary?.rating != null &&
          property.rating !== null
            ? primary.rating - property.rating
            : null,
        sharedReviewerGap:
          ready &&
          shared?.primaryRating != null &&
          shared.competitorRating !== null
            ? shared.primaryRating - shared.competitorRating
            : null,
      };
    }),
  };
}
