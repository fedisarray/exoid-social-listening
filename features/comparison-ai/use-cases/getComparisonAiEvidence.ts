import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { Period } from "@/features/_shared/schemas/period";
import {
  findComparisonAiImport,
  listComparisonAiAnnotations,
  listComparisonAiReviews,
} from "../repositories/comparisonAi";
export type ComparisonAiEvidenceResult = {
  reviews: {
    id: string;
    text: string;
    date: string | null;
    rating: number | null;
    listing: string | null;
    sheet: string;
    row: number;
    sourceUrl: string | null;
  }[];
  total: number;
};
export async function getComparisonAiEvidence(
  ctx: OperationContext,
  input: {
    analysisId: string;
    importId: string;
    period: Period;
    kind: string;
    value: string;
    offset: number;
  },
): Promise<ComparisonAiEvidenceResult> {
  const source = await findComparisonAiImport(
    ctx.db,
    ctx.organizationId,
    input.analysisId,
    input.importId,
  );
  if (!source || source.import_kind !== "review_rows")
    throw new Error("IMPORT_NOT_FOUND");
  const rows = await listComparisonAiReviews(
    ctx.db,
    ctx.organizationId,
    input.importId,
    input.period,
  );
  const annotations = ["sentiment", "theme"].includes(input.kind)
    ? await listComparisonAiAnnotations(
        ctx.db,
        ctx.organizationId,
        input.importId,
      )
    : [];
  const annotationsById = new Map(
    annotations.map((item) => [item.review_id, item]),
  );
  const filtered = rows.filter((row) => {
    if (input.kind === "sentiment")
      return annotationsById.get(row.id)?.sentiment === input.value;
    if (input.kind === "theme")
      return (
        annotationsById
          .get(row.id)
          ?.themes.some(
            (theme) => theme.toLowerCase() === input.value.toLowerCase(),
          ) ?? false
      );
    if (input.kind === "month")
      return row.published_at?.slice(0, 7) === input.value;
    if (input.kind === "listing") return row.listing_label === input.value;
    return (
      row.review_text
        .toLocaleLowerCase()
        .match(/[\p{L}]{3,}/gu)
        ?.includes(input.value.toLocaleLowerCase()) ?? false
    );
  });
  return {
    reviews: filtered.slice(input.offset, input.offset + 100).map((row) => ({
      id: row.id,
      text: row.review_text,
      date: row.published_at,
      rating: row.rating,
      listing: row.listing_label,
      sheet: row.sheet_name,
      row: row.row_number,
      sourceUrl: row.source_url,
    })),
    total: filtered.length,
  };
}
