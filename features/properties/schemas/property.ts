import { z } from "zod";
import { listingSchema } from "@/features/_shared/schemas/listing";
export const propertySchema = z.object({
  id: z.uuid(),
  listing: listingSchema,
  createdAt: z.string(),
});
export type Property = z.infer<typeof propertySchema>;
