import "server-only";
import { z } from "zod";
import type { StartDiscoveryInput } from "../schemas/startDiscoveryInput";
import {
  listingSchema,
  type Listing,
} from "@/features/_shared/schemas/listing";
const runSchema = z.object({
  data: z.object({
    id: z.string(),
    status: z.string(),
    defaultDatasetId: z.string().optional(),
    finishedAt: z.iso.datetime().nullish(),
  }),
});
async function request(path: string, init: RequestInit = {}): Promise<unknown> {
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
  if (!response.ok) throw new Error(`APIFY_REQUEST_FAILED_${response.status}`);
  return response.json();
}
export async function startProviderSearch(
  input: StartDiscoveryInput,
): Promise<string> {
  const actor =
    process.env.APIFY_DISCOVERY_ACTOR || "kaix~google-maps-places-scraper";
  const payload = {
    ...(input.url
      ? { placeIds: [input.url] }
      : {
          query: input.query,
          location: `${input.location}, ${input.country}`,
        }),
    maxResults: 10,
    language: "en",
  };
  const output = await request(
    `acts/${encodeURIComponent(actor)}/runs?timeout=300`,
    { method: "POST", body: JSON.stringify(payload) },
  );
  return runSchema.parse(output).data.id;
}
export async function getProviderSearch(
  id: string,
): Promise<{ status: string; results: Listing[] }> {
  const output = await request(`actor-runs/${encodeURIComponent(id)}`);
  const run = runSchema.parse(output).data;
  if (!run.defaultDatasetId) {
    if (run.status === "SUCCEEDED") throw new Error("APIFY_RESULTS_MISSING");
    return { status: run.status, results: [] };
  }
  const raw = await request(
    `datasets/${encodeURIComponent(run.defaultDatasetId)}/items?clean=true&limit=10`,
  );
  const rowSchema = z.object({
    placeId: z.string().nullish(),
    title: z.string().nullish(),
    address: z.string().nullish(),
    formattedAddress: z.string().nullish(),
    countryCode: z.string().nullish(),
    url: z.string().nullish(),
    googleMapsUri: z.string().nullish(),
    imageUrl: z.string().nullish(),
    profileImageUrl: z.string().nullish(),
    reviewsCount: z.number().int().nonnegative().nullish(),
    reviewCount: z.number().int().nonnegative().nullish(),
    scrapedAt: z.iso.datetime().nullish(),
    categoryName: z.string().nullish(),
    categories: z.array(z.string()).nullish(),
    totalScore: z.number().nullish(),
    rating: z.number().nullish(),
    website: z.string().nullish(),
    phone: z.string().nullish(),
  });
  const rows = z.array(z.unknown()).parse(raw);
  const results: Listing[] = [];
  for (const row of rows) {
    const parsed = rowSchema.safeParse(row);
    if (!parsed.success) continue;
    const r = parsed.data;
    const url = r.googleMapsUri ?? r.url;
    const imageUrl = r.profileImageUrl ?? r.imageUrl;
    const reviewsCount = r.reviewCount ?? r.reviewsCount;
    const rating = r.rating ?? r.totalScore;
    if (!r.placeId || !r.title || !url) continue;
    const checkedAt = r.scrapedAt ?? run.finishedAt;
    const listing = listingSchema.safeParse({
      source: "google",
      sourceId: r.placeId,
      name: r.title,
      address: r.formattedAddress ?? r.address ?? "",
      country: r.countryCode ?? "",
      url,
      categories: [
        ...new Set(
          [r.categoryName, ...(r.categories ?? [])].filter(
            (category): category is string => Boolean(category?.trim()),
          ),
        ),
      ],
      ...(rating && rating >= 1 && rating <= 5
        ? { googleMapsRating: rating }
        : {}),
      ...(r.website &&
      URL.canParse(r.website) &&
      ["http:", "https:"].includes(new URL(r.website).protocol)
        ? { website: r.website }
        : {}),
      ...(r.phone?.trim() ? { phone: r.phone.trim() } : {}),
      ...(reviewsCount !== null && reviewsCount !== undefined && checkedAt
        ? {
            googleMapsReviews: {
              count: reviewsCount,
              checkedAt,
            },
          }
        : {}),
      ...(imageUrl &&
      URL.canParse(imageUrl) &&
      new URL(imageUrl).protocol === "https:"
        ? { thumbnailUrl: imageUrl }
        : {}),
    });
    if (
      listing.success &&
      !results.some((result) => result.sourceId === listing.data.sourceId)
    )
      results.push(listing.data);
  }
  if (run.status === "SUCCEEDED" && rows.length && !results.length)
    throw new Error("APIFY_RESULTS_INVALID");
  return { status: run.status, results };
}
