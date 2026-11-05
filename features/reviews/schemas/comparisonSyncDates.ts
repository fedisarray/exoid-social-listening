import { dateIntervalSchema } from "./reviewCoverage";
import { lastCompleteDate } from "@/features/_shared/domain/period";

export const comparisonSyncDatesSchema = dateIntervalSchema.refine(
  (dates) => dates.start <= dates.end && dates.end <= lastCompleteDate(),
  { path: ["end"], message: "INVALID_PERIOD" },
);
