"use client";
import { useEffect, useRef } from "react";
import { ensureComparisonCoverage } from "../actions/ensureComparisonCoverage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReviewDashboard } from "../actions/getReviewDashboard";
import { startCollection } from "../actions/startCollection";
import type { GetReviewDashboardInput } from "../schemas/getReviewDashboardInput";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
const keys = {
  scope: (scopeId: string) => ["review-dashboard", scopeId] as const,
  detail: (input: GetReviewDashboardInput) =>
    ["review-dashboard", input.propertyId ?? input.analysisId, input] as const,
};
export function useReviewDashboard(
  input: GetReviewDashboardInput,
  initial: { input: GetReviewDashboardInput; data: ReviewDashboard },
) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: keys.detail(input),
    queryFn: () => getReviewDashboard(input),
    staleTime: 0,
    initialData:
      JSON.stringify(input) === JSON.stringify(initial.input)
        ? initial.data
        : undefined,
    refetchInterval: (q) =>
      q.state.data?.coverage.some((state) => state.activeRun) ||
      (q.state.data?.run &&
        ["queued", "running"].includes(q.state.data.run.status))
        ? 3000
        : false,
  });
  const invalidate = async () => {
    await client.invalidateQueries({ queryKey: ["properties"] });
    await client.invalidateQueries({
      queryKey: ["review-dashboard"],
      predicate: (cached) => {
        const data = cached.state.data as ReviewDashboard | undefined;
        return (
          cached.queryKey[1] === (input.propertyId ?? input.analysisId) ||
          Boolean(
            data?.coverage.some((state) =>
              query.data?.coverage.some(
                (current) =>
                  current.propertyId && current.propertyId === state.propertyId,
              ),
            ),
          )
        );
      },
    });
  };
  const ensure = useMutation({
    mutationFn: async ({
      analysisId,
      period,
      retry,
    }: {
      analysisId: string;
      period: GetReviewDashboardInput["period"];
      retry: boolean;
    }) => {
      const result = await ensureComparisonCoverage({
        analysisId,
        period,
        retry,
      });
      if (!result.ok) throw new Error(result.code);
    },
    onSettled: invalidate,
  });
  const active = Boolean(
    query.data?.coverage.some((state) => state.activeRun) ||
    (query.data?.run && ["queued", "running"].includes(query.data.run.status)),
  );
  const wasActive = useRef(false);
  useEffect(() => {
    if (wasActive.current && !active) {
      void client.invalidateQueries({ queryKey: ["properties"] });
      void client.invalidateQueries({
        queryKey: ["review-dashboard"],
        predicate: (cached) => {
          const data = cached.state.data as ReviewDashboard | undefined;
          return Boolean(
            data?.coverage.some((state) =>
              query.data?.coverage.some(
                (current) =>
                  current.propertyId && current.propertyId === state.propertyId,
              ),
            ),
          );
        },
      });
    }
    wasActive.current = active;
  }, [active, client, query.data?.coverage]);
  const collect = useMutation({
    mutationFn: async (maxReviews: number) => {
      const result = await startCollection({
        ...(input.propertyId
          ? { propertyId: input.propertyId, period: input.period }
          : { analysisId: input.analysisId }),
        maxReviews,
      });
      if (!result.ok) throw new Error(result.code);
      return result.runId;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["properties"] });
      await client.invalidateQueries({
        queryKey: keys.scope(input.propertyId ?? input.analysisId),
      });
    },
  });
  return { query, collect, ensure };
}
