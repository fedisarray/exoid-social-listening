import type { Period } from "@/features/_shared/schemas/period";
import { lastCompleteDate } from "@/features/_shared/domain/period";
export function propertyPeriod(): Period {
  const now = new Date();
  const end = lastCompleteDate(now);
  return {
    kind: "custom",
    year: now.getUTCFullYear(),
    quarter: Math.floor(now.getUTCMonth() / 3) + 1,
    start: "2022-01-01",
    end,
    cutoff: end,
  };
}
