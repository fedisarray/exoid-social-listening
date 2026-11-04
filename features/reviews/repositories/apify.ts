import "server-only";
import { z } from "zod";
const runSchema = z.object({
  data: z.object({
    id: z.string(),
    status: z.string(),
    defaultDatasetId: z.string().nullish(),
    buildId: z.string().nullish(),
    usageTotalUsd: z.number().nullish(),
  }),
});
async function request(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_NOT_CONFIGURED");
  const response = await fetch(`https://api.apify.com/v2/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const failure = z
      .object({ error: z.object({ type: z.string(), message: z.string() }) })
      .safeParse(body);
    if (
      response.status === 403 &&
      failure.success &&
      failure.data.error.type === "platform-feature-disabled" &&
      failure.data.error.message === "Monthly usage hard limit exceeded"
    )
      throw new Error("APIFY_USAGE_LIMIT_EXCEEDED");
    throw new Error(
      response.status === 401 || response.status === 403
        ? "APIFY_ACCESS_DENIED"
        : "APIFY_REQUEST_FAILED",
    );
  }
  return response;
}
export async function startReviewActor(
  listingId: string,
  start: string,
  maxReviews: number,
): Promise<string> {
  const placeId = z.string().trim().min(1).parse(listingId);
  const actor =
    process.env.APIFY_REVIEWS_ACTOR || "kaix~google-maps-reviews-scraper";
  const response = await request(
    `acts/${encodeURIComponent(actor)}/runs?timeout=1800`,
    {
      method: "POST",
      body: JSON.stringify({
        urls: [placeId],
        maxReviews,
        sort: "newest",
        reviewsNewerThan: `${start}T00:00:00Z`,
        language: "en",
      }),
    },
  );
  const output = await response.json();
  return runSchema.parse(output).data.id;
}
export async function readReviewActor(id: string): Promise<{
  status: string;
  datasetId: string | null;
  buildId: string | null;
  cost: number | null;
  total: number | null;
}> {
  const response = await request(`actor-runs/${encodeURIComponent(id)}`);
  const output = await response.json();
  const run = runSchema.parse(output).data;
  let total: number | null = null;
  if (
    run.defaultDatasetId &&
    ["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"].includes(run.status)
  ) {
    const datasetResponse = await request(
      `datasets/${encodeURIComponent(run.defaultDatasetId)}`,
    );
    const datasetOutput = await datasetResponse.json();
    total = z
      .object({ data: z.object({ itemCount: z.number().int().nonnegative() }) })
      .parse(datasetOutput).data.itemCount;
  }
  return {
    status: run.status,
    datasetId: run.defaultDatasetId ?? null,
    buildId: run.buildId ?? null,
    cost: run.usageTotalUsd ?? null,
    total,
  };
}
export async function readReviewPage(
  datasetId: string,
  offset: number,
  limit: number,
): Promise<unknown[]> {
  const response = await request(
    `datasets/${encodeURIComponent(datasetId)}/items?format=json&offset=${offset}&limit=${limit}`,
  );
  const output = await response.json();
  const rows = z.array(z.unknown()).parse(output);
  const rowSchema = z.object({
    reviewId: z.string().nullish(),
    place: z.object({ placeId: z.string() }),
    reviewOrigin: z.string().nullish(),
    rating: z.unknown(),
    publishedAt: z.string(),
    text: z.string().nullish(),
    originalLanguage: z.string().nullish(),
    author: z.object({ id: z.string().nullish() }).nullish(),
    url: z.string().nullish(),
  });
  return rows.map((raw) => {
    const parsed = rowSchema.safeParse(raw);
    // Existing Compass runs can still finish importing after the actor switch.
    if (!parsed.success) return raw;
    const row = parsed.data;
    return {
      reviewId: row.reviewId,
      placeId: row.place.placeId,
      reviewOrigin: row.reviewOrigin,
      stars: row.rating,
      publishedAtDate: row.publishedAt,
      text: row.text,
      originalLanguage: row.originalLanguage,
      reviewerId: row.author?.id,
      reviewUrl: row.url,
    };
  });
}
