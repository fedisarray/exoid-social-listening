import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { SaveAnalysisInput } from "../schemas/saveAnalysisInput";
import type { SaveAnalysisOutput } from "../schemas/saveAnalysisOutput";
import { persistAnalysis, findOwnedAnalysis } from "../repositories/analyses";
import { confirmedListings } from "@/features/discovery/queries/confirmedListings";
import { resolvePeriod } from "@/features/_shared/domain/period";
export async function saveAnalysis(
  ctx: OperationContext,
  input: SaveAnalysisInput,
): Promise<SaveAnalysisOutput> {
  const current = input.id
    ? await findOwnedAnalysis(ctx.db, input.id, ctx.userId)
    : null;
  if (input.id && (!current || current.version !== input.expectedVersion))
    return { ok: false, code: "CONFLICT" };
  const confirmed = await confirmedListings(ctx);
  const known = [...confirmed, ...(current?.config.listings ?? [])];
  const listings = [];
  for (const selected of input.config.listings) {
    const original = known.find((x) => x.sourceId === selected.sourceId);
    if (!original) return { ok: false, code: "UNCONFIRMED_LISTING" };
    listings.push({ ...original, role: selected.role, label: selected.label });
  }
  const config = {
    ...input.config,
    listings,
    period: resolvePeriod(input.config.period),
  };
  try {
    const result = await persistAnalysis(ctx.db, { ...input, config });
    if (result.conflict || !result.id) return { ok: false, code: "CONFLICT" };
    const analysis = await findOwnedAnalysis(ctx.db, result.id, ctx.userId);
    if (!analysis) throw new Error("SAVED_ANALYSIS_MISSING");
    return { ok: true, analysis };
  } catch (error) {
    console.error("saveAnalysis failed", {
      analysisId: input.id,
      error: error instanceof Error ? error.message : "database failure",
    });
    return { ok: false, code: "SAVE_FAILED" };
  }
}
