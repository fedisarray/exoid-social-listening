import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { findOrganizationAnalysis } from "../repositories/analyses";
import { findSavedListings } from "@/features/properties/repositories/properties";
import type { AnalysisDetail } from "../schemas/analysisDetail";
import { readConfirmedListings } from "@/features/discovery/repositories/discovery";
import { withListingDetails } from "@/features/_shared/domain/withListingDetails";
export async function getAnalysis(
  ctx: OperationContext,
  id: string,
): Promise<AnalysisDetail | null> {
  const analysis = await findOrganizationAnalysis(
    ctx.db,
    id,
    ctx.organizationId,
  );
  if (!analysis) return null;
  const [savedListings, discovered] = await Promise.all([
    findSavedListings(
      ctx.db,
      ctx.organizationId,
      analysis.config.listings.map((listing) => listing.sourceId),
    ),
    readConfirmedListings(ctx.db, ctx.organizationId),
  ]);
  return {
    ...analysis,
    config: {
      ...analysis.config,
      listings: analysis.config.listings.map((listing) =>
        withListingDetails(
          withListingDetails(
            listing,
            savedListings.find((saved) => saved.sourceId === listing.sourceId),
          ),
          discovered.find((found) => found.sourceId === listing.sourceId),
        ),
      ),
    },
  };
}
