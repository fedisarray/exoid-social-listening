import { ExportsScreen } from "@/features/reviews/screens/ExportsScreen";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  return <ExportsScreen searchParams={search} />;
}
