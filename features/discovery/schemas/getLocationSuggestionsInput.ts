import { z } from "zod";

export const getLocationSuggestionsInputSchema = z.object({
  query: z.string().trim().min(3).max(150),
  country: z.string().regex(/^[A-Z]{2}$/),
  locale: z.enum(["it", "en"]),
});
export type GetLocationSuggestionsInput = z.infer<
  typeof getLocationSuggestionsInputSchema
>;
