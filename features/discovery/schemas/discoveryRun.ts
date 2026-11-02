import { z } from "zod";
import { listingSchema } from "@/features/_shared/schemas/listing";
export const discoveryRunSchema = z.object({
  id: z.uuid(),
  status: z.enum(["queued", "running", "completed", "failed"]),
  results: z.array(listingSchema),
  error: z.string().nullable(),
});
export type DiscoveryRun = z.infer<typeof discoveryRunSchema>;
