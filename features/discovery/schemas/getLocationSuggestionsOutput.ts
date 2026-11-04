import { z } from "zod";

export const getLocationSuggestionsOutputSchema = z
  .array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1).max(150),
      country: z.string().regex(/^[A-Z]{2}$/),
    }),
  )
  .max(5);
export type LocationSuggestion = z.infer<
  typeof getLocationSuggestionsOutputSchema
>[number];
