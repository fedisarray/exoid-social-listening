import { z } from "zod";
export const listingSchema = z.object({
  source: z.literal("google"),
  sourceId: z.string().min(1),
  name: z.string().min(1).max(300),
  address: z.string().max(1000),
  country: z.string().max(100),
  url: z
    .url()
    .refine(
      (value) => URL.canParse(value) && new URL(value).protocol === "https:",
      "HTTPS_REQUIRED",
    ),
});
export type Listing = z.infer<typeof listingSchema>;
