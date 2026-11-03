import { AnalysisDashboardScreen } from "@/features/analyses/screens/AnalysisDashboardScreen";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const search = await searchParams;
  return <AnalysisDashboardScreen id={id} searchParams={search} />;
}
