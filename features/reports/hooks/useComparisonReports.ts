"use client";
import { cancelComparisonReport } from "../actions/cancelComparisonReport";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listComparisonReports } from "../actions/listComparisonReports";
import { startComparisonReport } from "../actions/startComparisonReport";
import { resumeComparisonReport } from "../actions/resumeComparisonReport";
import type { ListComparisonReportsOutput } from "../schemas/listComparisonReportsOutput";
import type { StartComparisonReportInput } from "../schemas/startComparisonReportInput";
export function useComparisonReports(
  analysisId: string,
  initialData?: ListComparisonReportsOutput,
) {
  const client = useQueryClient();
  const queryKey = ["comparison-reports", analysisId];
  const query = useQuery({
    queryKey,
    queryFn: () => listComparisonReports({ analysisId }),
    initialData,
    staleTime: 0,
    refetchInterval: (q) =>
      q.state.data?.reports.some(
        (report) =>
          !["completed", "failed", "cancelled"].includes(report.status),
      )
        ? 5000
        : false,
  });
  const invalidate = async () => {
    await client.invalidateQueries({ queryKey });
  };
  const generate = useMutation({
    mutationFn: (input: StartComparisonReportInput) =>
      startComparisonReport(input),
    onSuccess: invalidate,
  });
  const resume = useMutation({
    mutationFn: () => resumeComparisonReport({ analysisId }),
    onSuccess: async (result) => {
      if (result.ok && result.workerStarted) generate.reset();
      await invalidate();
    },
  });
  const cancel = useMutation({
    mutationFn: (reportId: string) => cancelComparisonReport({ reportId }),
    onSuccess: invalidate,
  });
  return { query, generate, resume, cancel };
}
