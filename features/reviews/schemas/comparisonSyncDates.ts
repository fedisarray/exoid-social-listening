import { dateIntervalSchema } from "./reviewCoverage";

export const comparisonSyncDatesSchema = dateIntervalSchema.refine(
  (dates) => dates.start <= dates.end,
  { path: ["end"], message: "INVALID_PERIOD" },
);
