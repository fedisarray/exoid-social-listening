import { z } from "zod";
export const periodSchema = z.object({
  kind: z.enum(["quarter", "l12m", "custom"]),
  year: z.number().int().min(2000).max(2100),
  quarter: z.number().int().min(1).max(4),
  cutoff: z.iso.date(),
  start: z.iso.date(),
  end: z.iso.date(),
});
export type Period = z.infer<typeof periodSchema>;
