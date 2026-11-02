import type { AnalysisConfig } from "../schemas/analysisConfig";
type Period = AnalysisConfig["period"];
function day(year: number, month: number, date: number): string {
  return new Date(Date.UTC(year, month, date)).toISOString().slice(0, 10);
}
export function resolvePeriod(period: Period): Period {
  if (period.kind === "quarter") {
    const month = (period.quarter - 1) * 3;
    const start = day(period.year, month, 1);
    const end = day(period.year, month + 3, 0);
    return { ...period, start, end, cutoff: end };
  }
  if (period.kind === "l12m") {
    const [y, m, d] = period.cutoff.split("-").map(Number);
    const last = day(y, m, 0);
    const complete = d === Number(last.slice(8)) ? m : m - 1;
    return {
      ...period,
      start: day(y, complete - 12, 1),
      end: day(y, complete, 0),
    };
  }
  return { ...period, cutoff: period.end };
}
export function defaultPeriod(): Period {
  return resolvePeriod({
    kind: "quarter",
    year: 2026,
    quarter: 1,
    cutoff: "2026-03-31",
    start: "2026-01-01",
    end: "2026-03-31",
  });
}
