"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveAnalysis } from "../actions/saveAnalysis";
import type { SaveAnalysisInput } from "../schemas/saveAnalysisInput";
import type { AnalysisDetail } from "../schemas/analysisDetail";
import { analysisKeys } from "../constants/queryKeys";
export function useSaveAnalysis(id: string | null) {
  const client = useQueryClient();
  return useMutation({
    scope: { id: id ?? "new-analysis" },
    mutationFn: async (input: SaveAnalysisInput) => {
      const result = await saveAnalysis(input);
      if (!result.ok) throw new Error(result.code);
      return result.analysis;
    },
    onMutate: async (input) => {
      if (!id) return { previous: undefined };
      const key = analysisKeys.detail(id);
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<AnalysisDetail>(key);
      if (previous)
        client.setQueryData(key, {
          ...previous,
          name: input.name,
          config: input.config,
        });
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (id && context?.previous)
        client.setQueryData(analysisKeys.detail(id), context.previous);
    },
    onSuccess: (output) => {
      client.setQueryData(analysisKeys.detail(output.id), output);
    },
    onSettled: async () => {
      if (id)
        await client.invalidateQueries({ queryKey: analysisKeys.detail(id) });
      await client.invalidateQueries({ queryKey: analysisKeys.list() });
    },
  });
}
