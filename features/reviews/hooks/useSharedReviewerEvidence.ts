"use client";
import { useQuery } from "@tanstack/react-query";
import { getSharedReviewerEvidence } from "../actions/getSharedReviewerEvidence";
import type { GetSharedReviewerEvidenceInput } from "../schemas/getSharedReviewerEvidenceInput";

export function useSharedReviewerEvidence(
  input: GetSharedReviewerEvidenceInput,
  datasetKey: string,
) {
  return useQuery({
    queryKey: ["shared-reviewer-evidence", input, datasetKey],
    queryFn: () => getSharedReviewerEvidence(input),
  });
}
