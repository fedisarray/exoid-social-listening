"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReviewDashboard } from "../actions/getReviewDashboard";
import { startCollection } from "../actions/startCollection";
import type { GetReviewDashboardInput } from "../schemas/getReviewDashboardInput";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
const keys = {
  scope: (analysisId: string) => ["review-dashboard", analysisId] as const,
  detail: (input: GetReviewDashboardInput) =>
    ["review-dashboard", input.analysisId, input] as const,
};
export function useReviewDashboard(
  input: GetReviewDashboardInput,
  initial: { input: GetReviewDashboardInput; data: ReviewDashboard },
) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: keys.detail(input),
    queryFn: () => getReviewDashboard(input),
    initialData:
      JSON.stringify(input) === JSON.stringify(initial.input)
        ? initial.data
        : undefined,
    refetchInterval: (q) =>
      q.state.data?.run &&
      ["queued", "running"].includes(q.state.data.run.status)
        ? 3000
        : false,
  });
  const collect = useMutation({
    mutationFn: async (maxReviews: number) => {
      const result = await startCollection({
        analysisId: input.analysisId,
        maxReviews,
      });
      if (!result.ok) throw new Error(result.code);
      return result.runId;
    },
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: keys.scope(input.analysisId),
      });
    },
  });
  return { query, collect };
}
