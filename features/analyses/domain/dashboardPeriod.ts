import { periodSchema, type Period } from "@/features/_shared/schemas/period";
import { resolvePeriod } from "@/features/_shared/domain/period";
export function dashboardPeriod(
  saved: Period,
  params: Record<string, string | string[] | undefined>,
): Period {
  const candidate = periodSchema.safeParse({
    ...saved,
    kind: params.kind ?? saved.kind,
    year: Number(params.year ?? saved.year),
    quarter: Number(params.quarter ?? saved.quarter),
    cutoff: params.cutoff ?? saved.cutoff,
    start: params.start ?? saved.start,
    end: params.end ?? saved.end,
  });
  const period = resolvePeriod(candidate.success ? candidate.data : saved);
  return period.start <= period.end ? period : saved;
}
