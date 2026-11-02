import { AnalysisSetupScreen } from "@/features/analyses/screens/AnalysisSetupScreen";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AnalysisSetupScreen id={id} />;
}
