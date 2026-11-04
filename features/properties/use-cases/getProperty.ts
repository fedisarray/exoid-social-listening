import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { findOrganizationProperty } from "../repositories/properties";
import type { Property } from "../schemas/property";
import { readConfirmedListings } from "@/features/discovery/repositories/discovery";
import { withListingDetails } from "@/features/_shared/domain/withListingDetails";
export async function getProperty(
  ctx: OperationContext,
  id: string,
): Promise<Property | null> {
  const property = await findOrganizationProperty(
    ctx.db,
    ctx.organizationId,
    id,
  );
  if (!property) return null;
  const discovered = await readConfirmedListings(ctx.db, ctx.organizationId);
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
