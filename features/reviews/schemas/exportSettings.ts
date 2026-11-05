import { z } from "zod";
import { exportReviewExcelInputSchema } from "./exportReviewExcelInput";

export const exportSettingsSchema = exportReviewExcelInputSchema.pick({
  locale: true,
  options: true,
  period: true,
});
export type ExportSettings = z.infer<typeof exportSettingsSchema>;
