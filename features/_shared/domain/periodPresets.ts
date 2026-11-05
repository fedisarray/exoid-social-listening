import type { Period } from "../schemas/period";
import { lastCompleteDate, resolvePeriod } from "./period";

export const relativePeriodPresets = [
  "today",
  "yesterday",
  "thisWeek",
  "lastWeek",
  "twoWeeksAgo",
  "last7Days",
  "thisMonth",
  "lastMonth",
  "twoMonthsAgo",
  "last30Days",
  "thisYear",
  "lastYear",
  "twoYearsAgo",
] as const;

export type PeriodPreset =
  | (typeof relativePeriodPresets)[number]
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "l12m"
  | "custom";

export function resolvePeriodPreset(
  preset: PeriodPreset,
  period: Period,
  now = new Date(),
): Period {
  if (preset === "custom") return { ...period, kind: "custom" };
  if (preset === "l12m")
    return resolvePeriod({
      ...period,
      kind: "l12m",
      cutoff: lastCompleteDate(now),
    });
  if (preset.startsWith("q"))
    return resolvePeriod({
      ...period,
      kind: "quarter",
      quarter: Number(preset.slice(1)),
    });

  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const date = now.getUTCDate();
  const day = (year: number, month: number, date: number) =>
    new Date(Date.UTC(year, month, date)).toISOString().slice(0, 10);
  const today = day(year, month, date);
  const yesterday = day(year, month, date - 1);
  const monday = date - ((now.getUTCDay() + 6) % 7);
  let start: string;
  let end: string;
  switch (preset) {
    case "today":
      start = end = today;
      break;
    case "yesterday":
      start = end = yesterday;
      break;
    case "thisWeek":
      start = day(year, month, monday);
      end = today;
      break;
    case "lastWeek":
      start = day(year, month, monday - 7);
      end = day(year, month, monday - 1);
      break;
    case "twoWeeksAgo":
      start = day(year, month, monday - 14);
      end = day(year, month, monday - 8);
      break;
    case "last7Days":
      start = day(year, month, date - 7);
      end = yesterday;
      break;
    case "thisMonth":
      start = day(year, month, 1);
      end = today;
      break;
    case "lastMonth":
      start = day(year, month - 1, 1);
      end = day(year, month, 0);
      break;
    case "twoMonthsAgo":
      start = day(year, month - 2, 1);
      end = day(year, month - 1, 0);
      break;
    case "last30Days":
      start = day(year, month, date - 30);
      end = yesterday;
      break;
    case "thisYear":
      start = day(year, 0, 1);
      end = today;
      break;
    case "lastYear":
      start = day(year - 1, 0, 1);
      end = day(year - 1, 11, 31);
      break;
    case "twoYearsAgo":
      start = day(year - 2, 0, 1);
      end = day(year - 2, 11, 31);
      break;
    default:
      return period;
  }
  return { ...period, kind: "custom", start, end, cutoff: end };
}
