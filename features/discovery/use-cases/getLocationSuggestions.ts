import "server-only";
import { searchLocations } from "../repositories/locations";
import type { GetLocationSuggestionsInput } from "../schemas/getLocationSuggestionsInput";
import type { LocationSuggestion } from "../schemas/getLocationSuggestionsOutput";

export async function getLocationSuggestions(
  input: GetLocationSuggestionsInput,
): Promise<LocationSuggestion[]> {
  const suggestions = await searchLocations(input);
  return suggestions;
}
