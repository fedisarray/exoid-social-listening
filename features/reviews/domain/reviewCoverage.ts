import type {
  DateInterval,
  StoredCoverage,
  ReviewCoverage,
} from "../schemas/reviewCoverage";
function nextDay(date: string, offset: number): string {
  const day = new Date(`${date}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + offset);
  return day.toISOString().slice(0, 10);
}
export function missingIntervals(
  covered: DateInterval[],
  period: DateInterval,
): DateInterval[] {
  const missing: DateInterval[] = [];
  let start = period.start;
  for (const range of [...covered].sort((a, b) =>
    a.start.localeCompare(b.start),
  )) {
    if (range.end < start) continue;
    if (range.start > period.end) break;
    if (range.start > start)
      missing.push({ start, end: nextDay(range.start, -1) });
    if (range.end >= period.end) return missing;
    start = nextDay(range.end, 1);
  }
  if (start <= period.end) missing.push({ start, end: period.end });
  return missing;
}
export function reviewCoverage(
  stored: StoredCoverage[],
  period: DateInterval,
  today: string,
): ReviewCoverage[] {
  return stored.map((state) => {
    const missing = missingIntervals(state.covered, period);
    const reason = !missing.length
      ? "covered"
      : !state.propertyId
        ? "placeRemoved"
        : state.activeRun
          ? "collecting"
          : missing.every((range) => range.start >= today)
            ? "future"
            : !state.collections.length
              ? "notCollected"
              : "incomplete";
    return { ...state, missing, ready: !missing.length, reason };
  });
}
export function windowCovered(
  coverage: StoredCoverage[],
  period: DateInterval,
): boolean {
  return (
    coverage.length > 0 &&
    coverage.every(
      (state) => missingIntervals(state.covered, period).length === 0,
    )
  );
}
