"use server";
import { requireUser } from "@/lib/auth/dal";
import {
  getOrganizationOutputSchema,
  type GetOrganizationOutput,
} from "../schemas/getOrganizationOutput";
import { getOrganization as execute } from "../use-cases/getOrganization";
export async function getOrganization(): Promise<GetOrganizationOutput> {
  const ctx = await requireUser();
  const result = await execute(ctx);
  return getOrganizationOutputSchema.parse(result);
}
