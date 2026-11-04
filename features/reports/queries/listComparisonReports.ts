import "server-only";
import { requireUser } from "@/lib/auth/dal";
import { listComparisonReportsInputSchema } from "../schemas/listComparisonReportsInput";
import {
  listComparisonReportsOutputSchema,
  type ListComparisonReportsOutput,
} from "../schemas/listComparisonReportsOutput";
import { listComparisonReports as execute } from "../use-cases/listComparisonReports";
export async function listComparisonReports(
  raw: unknown,
): Promise<ListComparisonReportsOutput> {
  const input = listComparisonReportsInputSchema.parse(raw);
  const ctx = await requireUser();
  const result = await execute(ctx, input);
  return listComparisonReportsOutputSchema.parse(result);
}
