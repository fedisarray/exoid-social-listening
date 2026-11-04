import type { Period } from "@/features/_shared/schemas/period";
export function propertyPeriod(): Period {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  return {
    kind: "custom",
    year: now.getUTCFullYear(),
    quarter: Math.floor(now.getUTCMonth() / 3) + 1,
    start: "2022-01-01",
    end,
    cutoff: end,
  };
}
