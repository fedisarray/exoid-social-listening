"use server";
import { requireUser } from "@/lib/auth/dal";
import { getLocationSuggestionsInputSchema } from "../schemas/getLocationSuggestionsInput";
import {
  getLocationSuggestionsOutputSchema,
  type LocationSuggestion,
} from "../schemas/getLocationSuggestionsOutput";
import { getLocationSuggestions as execute } from "../use-cases/getLocationSuggestions";

export async function getLocationSuggestions(
  raw: unknown,
): Promise<LocationSuggestion[]> {
  const input = getLocationSuggestionsInputSchema.parse(raw);
  await requireUser();
  const output = await execute(input);
  return getLocationSuggestionsOutputSchema.parse(output);
}
