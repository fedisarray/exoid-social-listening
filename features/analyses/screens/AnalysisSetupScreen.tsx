import { notFound } from "next/navigation";
import { getAnalysisInputSchema } from "../schemas/getAnalysisInput";
import { getAnalysis } from "../queries/getAnalysis";
import { AnalysisEditor } from "./AnalysisEditor";
export async function AnalysisSetupScreen({ id }: { id: string }) {
  if (!getAnalysisInputSchema.safeParse({ id }).success) notFound();
  const analysis = await getAnalysis({ id });
  if (!analysis) notFound();
  return <AnalysisEditor initial={analysis} />;
}
