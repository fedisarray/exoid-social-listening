import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { findOwnedProperty } from "../repositories/properties";
import type { Property } from "../schemas/property";
import { readConfirmedListings } from "@/features/discovery/repositories/discovery";
import { withListingDetails } from "@/features/_shared/domain/withListingDetails";
export async function getProperty(
  ctx: OperationContext,
  id: string,
): Promise<Property | null> {
  const property = await findOwnedProperty(ctx.db, ctx.userId, id);
  if (!property) return null;
  const discovered = await readConfirmedListings(ctx.db, ctx.userId);
  return {
    ...property,
    listing: withListingDetails(
      property.listing,
      discovered.find(
        (listing) => listing.sourceId === property.listing.sourceId,
      ),
    ),
  };
}
