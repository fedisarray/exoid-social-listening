import { z } from "zod";
export const listingSchema = z.object({
  source: z.literal("google"),
  sourceId: z.string().min(1),
  name: z.string().min(1).max(300),
  address: z.string().max(1000),
  country: z.string().max(100),
  categories: z.array(z.string().min(1).max(200)).max(30).optional(),
  googleMapsRating: z.number().min(1).max(5).optional(),
  website: z
    .url()
    .refine((value) => ["https:", "http:"].includes(new URL(value).protocol))
    .optional(),
  phone: z.string().min(1).max(100).optional(),
  googleMapsReviews: z
    .object({
      count: z.number().int().nonnegative(),
      checkedAt: z.iso.datetime(),
    })
    .optional(),
  thumbnailUrl: z
    .url()
    .refine((value) => new URL(value).protocol === "https:", "HTTPS_REQUIRED")
    .optional(),
  url: z
    .url()
    .refine(
      (value) => URL.canParse(value) && new URL(value).protocol === "https:",
      "HTTPS_REQUIRED",
    ),
});
export type Listing = z.infer<typeof listingSchema>;
