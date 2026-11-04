import "server-only";
import { requireUser } from "@/lib/auth/dal";
import {
  listOrganizationMembersOutputSchema,
  type ListOrganizationMembersOutput,
} from "../schemas/listOrganizationMembersOutput";
import { listOrganizationMembers as execute } from "../use-cases/listOrganizationMembers";
export async function listOrganizationMembers(): Promise<ListOrganizationMembersOutput> {
  const ctx = await requireUser();
  const result = await execute(ctx);
  return listOrganizationMembersOutputSchema.parse(result);
}
