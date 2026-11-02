import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import {
  listingSchema,
  type Listing,
} from "@/features/_shared/schemas/listing";
import { confirmedListings as execute } from "../use-cases/confirmedListings";
// Public server contract for canonical identities discovered by this analyst.
export async function confirmedListings(
  ctx: OperationContext,
): Promise<Listing[]> {
  const output = await execute(ctx);
  return listingSchema.array().parse(output);
}
