import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { listOwnedProperties } from "../repositories/properties";
import type { PropertySummary } from "../schemas/listPropertiesOutput";
import { readConfirmedListings } from "@/features/discovery/repositories/discovery";
import { withListingDetails } from "@/features/_shared/domain/withListingDetails";
export async function listProperties(
  ctx: OperationContext,
): Promise<PropertySummary[]> {
  const [properties, discovered] = await Promise.all([
    listOwnedProperties(ctx.db),
    readConfirmedListings(ctx.db, ctx.userId),
  ]);
  return properties.map((property) => ({
    ...property,
    listing: withListingDetails(
      property.listing,
      discovered.find(
        (listing) => listing.sourceId === property.listing.sourceId,
      ),
    ),
  }));
}
