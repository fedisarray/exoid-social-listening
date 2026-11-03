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
  if (!response.ok)
    throw new Error(
      response.status === 401 || response.status === 403
        ? "APIFY_ACCESS_DENIED"
        : "APIFY_REQUEST_FAILED",
    );
  return response;
}
export async function startReviewActor(
  url: string,
  start: string,
  maxReviews: number,
): Promise<string> {
  if (
    !URL.canParse(url) ||
    new URL(url).protocol !== "https:" ||
    ![
      "google.com",
      "www.google.com",
      "maps.google.com",
      "maps.app.goo.gl",
      "goo.gl",
    ].includes(new URL(url).hostname)
  )
    throw new Error("INVALID_LISTING_URL");
  const actor =
    process.env.APIFY_REVIEWS_ACTOR || "compass~google-maps-reviews-scraper";
  const response = await request(
    `acts/${encodeURIComponent(actor)}/runs?timeout=1800`,
    {
      method: "POST",
      body: JSON.stringify({
        startUrls: [{ url }],
        maxReviews,
        reviewsSort: "newest",
        reviewsStartDate: `${start}T00:00:00Z`,
        reviewsOrigin: "google",
        personalData: true,
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
  return z.array(z.unknown()).parse(output);
}
