import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  workbookReviewSchema,
  type WorkbookReview,
} from "../schemas/comparisonAiWorkbook";

export async function listWorkbookSnapshotReviews(
  db: SupabaseClient<Database>,
  organizationId: string,
  snapshotId: string,
): Promise<WorkbookReview[]> {
  const rows: WorkbookReview[] = [];
  // Use explicit pages: PostgREST's response limit can otherwise silently truncate a workbook.
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db
      .from("review_snapshot_items")
      .select(
        "review_id,revision_id,source_reviews!inner(listing_id),review_revisions!inner(published_at,rating,original_text,original_language,review_url)",
      )
      .eq("organization_id", organizationId)
      .eq("snapshot_id", snapshotId)
      .order("review_id")
      .range(offset, offset + 499);
    if (error) throw error;
    for (const row of data) {
      const revision = row.review_revisions;
      rows.push(
        workbookReviewSchema.parse({
          reviewId: row.review_id,
          revisionId: row.revision_id,
          listingId: row.source_reviews.listing_id,
          publishedAt: revision.published_at,
          rating: revision.rating,
          text: revision.original_text,
          language: revision.original_language,
          url: revision.review_url,
        }),
      );
    }
    if (data.length < 500) return rows;
  }
}
