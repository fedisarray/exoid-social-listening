import { z } from "zod";
const googleUrl = z.url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const u = new URL(value);
  return (
    u.protocol === "https:" &&
    ([
      "maps.app.goo.gl",
      "maps.google.com",
      "www.google.com",
      "google.com",
    ].includes(u.hostname) ||
      (u.hostname === "goo.gl" && u.pathname.startsWith("/maps")))
  );
}, "GOOGLE_URL_REQUIRED");
export const startDiscoveryInputSchema = z
  .object({
    query: z.string().trim().max(200),
    location: z.string().trim().max(150),
    country: z.string().regex(/^[A-Z]{2}$/),
    url: z.union([googleUrl, z.literal("")]),
  })
  .refine(
    (value) => Boolean(value.url || (value.query && value.location)),
    "SEARCH_REQUIRED",
  );
export type StartDiscoveryInput = z.infer<typeof startDiscoveryInputSchema>;
