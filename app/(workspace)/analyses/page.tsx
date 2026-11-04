import { AnalysesScreen } from "@/features/analyses/screens/AnalysesScreen";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  return (
    <AnalysesScreen
      search={typeof search.q === "string" ? search.q.slice(0, 200) : ""}
    />
  );
}
