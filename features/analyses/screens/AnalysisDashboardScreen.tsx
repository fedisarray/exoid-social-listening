import { notFound } from "next/navigation";
import { getAnalysisInputSchema } from "../schemas/getAnalysisInput";
import { getAnalysis } from "../queries/getAnalysis";
import { AnalysisDashboard } from "./AnalysisDashboard";
export async function AnalysisDashboardScreen({ id }: { id: string }) {
  if (!getAnalysisInputSchema.safeParse({ id }).success) notFound();
  const analysis = await getAnalysis({ id });
  if (!analysis) notFound();
  return <AnalysisDashboard analysis={analysis} />;
}
