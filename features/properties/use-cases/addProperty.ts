import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { readConfirmedListings } from "@/features/discovery/repositories/discovery";
import { insertProperty } from "../repositories/properties";
import type { Property } from "../schemas/property";
export async function addProperty(
  ctx: OperationContext,
  sourceId: string,
): Promise<Property> {
  const listings = await readConfirmedListings(ctx.db, ctx.organizationId);
  const listing = listings.find((candidate) => candidate.sourceId === sourceId);
  if (!listing) throw new Error("UNCONFIRMED_LISTING");
  return insertProperty(ctx.db, ctx.organizationId, listing);
}
