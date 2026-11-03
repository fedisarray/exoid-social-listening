"use server";
import { requireUser } from "@/lib/auth/dal";
import { getReviewDashboardInputSchema } from "../schemas/getReviewDashboardInput";
import {
  getReviewDashboardOutputSchema,
  type ReviewDashboard,
} from "../schemas/getReviewDashboardOutput";
import { getReviewDashboard as execute } from "../use-cases/getReviewDashboard";
export async function getReviewDashboard(
  raw: unknown,
): Promise<ReviewDashboard> {
  const input = getReviewDashboardInputSchema.parse(raw);
  const ctx = await requireUser();
  const output = await execute(ctx, input);
  return getReviewDashboardOutputSchema.parse(output);
}
