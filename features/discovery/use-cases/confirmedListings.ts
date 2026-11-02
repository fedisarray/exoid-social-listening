import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { Listing } from "@/features/_shared/schemas/listing";
import { readConfirmedListings } from "../repositories/discovery";
export async function confirmedListings(
  ctx: OperationContext,
): Promise<Listing[]> {
  return readConfirmedListings(ctx.db, ctx.userId);
}
