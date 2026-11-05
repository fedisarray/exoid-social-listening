import { z } from "zod";
export const comparisonAiBusinessCodeSchema = z.enum([
  "SCOPE_NOT_FOUND",
  "IMPORT_NOT_FOUND",
  "REVIEW_ROWS_REQUIRED",
  "ANTHROPIC_NOT_CONFIGURED",
  "AI_REQUEST_FAILED",
  "COMPARISON_AI_WORKER_NOT_CONFIGURED",
  "NO_REVIEW_ROWS",
  "SNAPSHOTS_REQUIRED",
  "SNAPSHOTS_INVALID",
  "SNAPSHOT_NOT_FOUND",
]);
export function comparisonAiBusinessError(error: unknown): string | null {
  const message = error instanceof Error ? error.message : "";
  const parsed = comparisonAiBusinessCodeSchema.safeParse(message);
  return parsed.success ? parsed.data : null;
}
