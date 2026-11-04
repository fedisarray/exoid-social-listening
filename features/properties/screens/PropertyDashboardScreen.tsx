import { notFound } from "next/navigation";
import { getProperty } from "../queries/getProperty";
import { getPropertyInputSchema } from "../schemas/getPropertyInput";
import { getReviewDashboard } from "@/features/reviews/queries/getReviewDashboard";
import { dashboardPeriod } from "@/features/analyses/domain/dashboardPeriod";
import { propertyPeriod } from "../domain/propertyPeriod";
import { PropertyDashboard } from "./PropertyDashboard";
export async function PropertyDashboardScreen({
  id,
  searchParams,
}: {
  id: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (!getPropertyInputSchema.safeParse({ id }).success) notFound();
  const property = await getProperty({ id });
  if (!property) notFound();
  const defaultPeriod = propertyPeriod();
  const period = dashboardPeriod(defaultPeriod, searchParams);
  const snapshotId =
    typeof searchParams.snapshot === "string" &&
    /^[0-9a-f-]{36}$/i.test(searchParams.snapshot)
      ? searchParams.snapshot
      : undefined;
  const input = {
    propertyId: id,
    period,
    ...(snapshotId ? { snapshotId } : {}),
  };
  const data = await getReviewDashboard(input);
  return (
    <PropertyDashboard
      property={property}
      defaultPeriod={defaultPeriod}
      initial={{ input, data }}
    />
  );
}
