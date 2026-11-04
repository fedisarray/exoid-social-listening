import { PropertyDashboardScreen } from "@/features/properties/screens/PropertyDashboardScreen";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const search = await searchParams;
  return <PropertyDashboardScreen id={id} searchParams={search} />;
}
