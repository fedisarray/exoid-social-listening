import "server-only";
import { z } from "zod";
import type { StartDiscoveryInput } from "../schemas/startDiscoveryInput";
import type { Listing } from "@/features/_shared/schemas/listing";
const runSchema = z.object({
  data: z.object({
    id: z.string(),
    status: z.string(),
    defaultDatasetId: z.string().optional(),
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
  if (!response.ok) throw new Error("APIFY_REQUEST_FAILED");
  return response.json();
}
export async function startProviderSearch(
  input: StartDiscoveryInput,
): Promise<string> {
  const actor =
    process.env.APIFY_DISCOVERY_ACTOR || "compass~crawler-google-places";
  const payload = {
    ...(input.url
      ? { startUrls: [{ url: input.url }] }
      : {
          searchStringsArray: [input.query],
          locationQuery: input.location,
          countryCode: input.country.toLowerCase(),
        }),
    maxCrawledPlacesPerSearch: 10,
    maxReviews: 0,
    scrapePlaceDetailPage: true,
    language: "en",
  };
  const output = await request(
    `acts/${encodeURIComponent(actor)}/runs?timeout=180`,
    { method: "POST", body: JSON.stringify(payload) },
  );
  return runSchema.parse(output).data.id;
}
export async function getProviderSearch(
  id: string,
): Promise<{ status: string; results: Listing[] }> {
  const output = await request(`actor-runs/${encodeURIComponent(id)}`);
  const run = runSchema.parse(output).data;
  if (run.status !== "SUCCEEDED") return { status: run.status, results: [] };
  if (!run.defaultDatasetId) throw new Error("APIFY_RESULTS_MISSING");
  const raw = await request(
    `datasets/${encodeURIComponent(run.defaultDatasetId)}/items?clean=true&limit=10`,
  );
  const rows = z
    .array(
      z.object({
        placeId: z.string().optional(),
        title: z.string().optional(),
        address: z.string().optional(),
        countryCode: z.string().optional(),
        url: z.string().optional(),
      }),
    )
    .parse(raw);
  const results: Listing[] = rows
    .filter(
      (r): r is typeof r & { placeId: string; title: string; url: string } =>
        Boolean(r.placeId && r.title && r.url),
    )
    .map((r) => ({
      source: "google",
      sourceId: r.placeId,
      name: r.title,
      address: r.address ?? "",
      country: r.countryCode ?? "",
      url: r.url,
    }));
  if (rows.length && !results.length) throw new Error("APIFY_RESULTS_INVALID");
  return { status: run.status, results };
}
