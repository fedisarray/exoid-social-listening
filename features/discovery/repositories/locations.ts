import "server-only";
import { z } from "zod";
import type { GetLocationSuggestionsInput } from "../schemas/getLocationSuggestionsInput";
import type { LocationSuggestion } from "../schemas/getLocationSuggestionsOutput";

const responseSchema = z.object({
  features: z.array(
    z.object({
      properties: z.object({
        osm_type: z.string(),
        osm_id: z.number(),
        name: z.string(),
        state: z.string().optional(),
        county: z.string().optional(),
        country: z.string(),
        countrycode: z.string(),
      }),
    }),
  ),
});

export async function searchLocations(
  input: GetLocationSuggestionsInput,
): Promise<LocationSuggestion[]> {
  const params = new URLSearchParams({
    q: input.query,
    countrycode: input.country,
    lang: input.locale === "it" ? "default" : "en",
    limit: "5",
  });
  for (const layer of [
    "country",
    "state",
    "county",
    "city",
    "district",
    "locality",
  ])
    params.append("layer", layer);
  const response = await fetch(`https://photon.komoot.io/api/?${params}`, {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("LOCATION_SEARCH_FAILED");
  const raw: unknown = await response.json();
  const data = responseSchema.parse(raw);
  const suggestions = data.features.map(({ properties: place }) => ({
    id: `${place.osm_type}${place.osm_id}`,
    label: [
      ...new Set(
        [place.name, place.county, place.state, place.country].filter(Boolean),
      ),
    ].join(", "),
    country: place.countrycode.toUpperCase(),
  }));
  return suggestions
    .filter(
      (place, index) =>
        place.country === input.country &&
        place.label.length <= 150 &&
        suggestions.findIndex((other) => other.label === place.label) === index,
    )
    .slice(0, 5);
}
