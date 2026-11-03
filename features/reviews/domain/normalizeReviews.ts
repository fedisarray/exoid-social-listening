import { createHash } from "node:crypto";
import { z } from "zod";
const rowSchema = z.object({
  reviewId: z.string().nullish(),
  placeId: z.string().nullish(),
  reviewOrigin: z.string().nullish(),
  stars: z.unknown(),
  publishedAtDate: z.string().nullish(),
  text: z.string().nullish(),
  originalLanguage: z.string().nullish(),
  reviewerId: z.string().nullish(),
  reviewUrl: z.string().nullish(),
});
export type NormalizedReview = {
  sourceReviewId: string;
  rating: number | null;
  publishedAt: string;
  text: string;
  language: string | null;
  reviewerId: string | null;
  url: string | null;
  contentHash: string;
};
export function normalizeReviews(
  rows: unknown[],
  listingId: string,
): { reviews: NormalizedReview[]; skipped: number; missingIds: number } {
  const reviews: NormalizedReview[] = [];
  let skipped = 0,
    missingIds = 0;
  for (const raw of rows) {
    const result = rowSchema.safeParse(raw);
    if (!result.success) {
      skipped++;
      continue;
    }
    const r = result.data;
    if (!r.reviewId?.trim()) {
      skipped++;
      missingIds++;
      continue;
    }
    if (
      (r.placeId && r.placeId !== listingId) ||
      (r.reviewOrigin && r.reviewOrigin.toLowerCase() !== "google")
    ) {
      skipped++;
      continue;
    }
    const time = Date.parse(r.publishedAtDate ?? "");
    if (!Number.isFinite(time)) {
      skipped++;
      continue;
    }
    const rating =
      typeof r.stars === "number" &&
      Number.isInteger(r.stars) &&
      r.stars >= 1 &&
      r.stars <= 5
        ? r.stars
        : null;
    const url =
      r.reviewUrl &&
      URL.canParse(r.reviewUrl) &&
      new URL(r.reviewUrl).protocol === "https:"
        ? r.reviewUrl
        : null;
    const content = {
      rating,
      publishedAt: new Date(time).toISOString(),
      text: r.text ?? "",
      language: r.originalLanguage || null,
      reviewerId: r.reviewerId?.trim() || null,
      url,
    };
    const contentHash = createHash("sha256")
      .update(JSON.stringify(content))
      .digest("hex");
    reviews.push({ sourceReviewId: r.reviewId, ...content, contentHash });
  }
  return { reviews, skipped, missingIds };
}
