import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  organizationMembershipSchema,
  type OrganizationMembership,
} from "../schemas/organizationMembership";
import type { GetOrganizationOutput } from "../schemas/getOrganizationOutput";
import type { ListOrganizationMembersOutput } from "../schemas/listOrganizationMembersOutput";
import {
  organizationErrorCodeSchema,
  type OrganizationMutationOutput,
} from "../schemas/organizationMutationOutput";
import type { UpdateOrganizationInput } from "../schemas/updateOrganizationInput";
import type { AddOrganizationMemberInput } from "../schemas/addOrganizationMemberInput";
import type { ChangeOrganizationMemberRoleInput } from "../schemas/changeOrganizationMemberRoleInput";
import type { RemoveOrganizationMemberInput } from "../schemas/removeOrganizationMemberInput";
import type { TransferOrganizationOwnershipInput } from "../schemas/transferOrganizationOwnershipInput";
type DB = SupabaseClient<Database>;
export async function findOrganizationMembership(
  db: DB,
  userId: string,
): Promise<OrganizationMembership | null> {
  const { data, error } = await db
    .from("organization_memberships")
    .select("organization_id,role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data
    ? organizationMembershipSchema.parse({
        organizationId: data.organization_id,
        role: data.role,
      })
    : null;
}
export async function readOrganization(
  db: DB,
  organizationId: string,
): Promise<Omit<GetOrganizationOutput, "role">> {
  const { data, error } = await db
    .from("organizations")
    .select("id,name,report_template_id")
    .eq("id", organizationId)
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    reportTemplateId: data.report_template_id,
  };
}
export async function readOrganizationMembers(
  db: DB,
  organizationId: string,
): Promise<ListOrganizationMembersOutput> {
  const { data, error } = await db
    .from("organization_memberships")
    .select("user_id,role,created_at")
    .eq("organization_id", organizationId)
    .order("created_at");
  if (error) throw error;
  return data.map((row) => ({
    userId: row.user_id,
    role: organizationMembershipSchema.shape.role.parse(row.role),
    joinedAt: row.created_at,
  }));
}
function mutationResult(
  error: { message: string } | null,
): OrganizationMutationOutput {
  if (!error) return { ok: true };
  const code = organizationErrorCodeSchema.safeParse(error.message);
  if (code.success) return { ok: false, code: code.data };
  throw error;
}
export async function updateOrganization(
  db: DB,
  input: UpdateOrganizationInput,
): Promise<OrganizationMutationOutput> {
  const { error } = await db.rpc("update_organization", {
    p_name: input.name,
    p_report_template_id: input.reportTemplateId ?? undefined,
  });
  return mutationResult(error);
}
export async function addOrganizationMember(
  db: DB,
  input: AddOrganizationMemberInput,
): Promise<OrganizationMutationOutput> {
  const { error } = await db.rpc("add_organization_member", {
    p_user_id: input.userId,
    p_role: input.role,
  });
  return mutationResult(error);
}
export async function changeOrganizationMemberRole(
  db: DB,
  input: ChangeOrganizationMemberRoleInput,
): Promise<OrganizationMutationOutput> {
  const { error } = await db.rpc("change_organization_member_role", {
    p_user_id: input.userId,
    p_role: input.role,
  });
  return mutationResult(error);
}
export async function removeOrganizationMember(
  db: DB,
  input: RemoveOrganizationMemberInput,
): Promise<OrganizationMutationOutput> {
  const { error } = await db.rpc("remove_organization_member", {
    p_user_id: input.userId,
  });
  return mutationResult(error);
}
export async function transferOrganizationOwnership(
  db: DB,
  input: TransferOrganizationOwnershipInput,
): Promise<OrganizationMutationOutput> {
  const { error } = await db.rpc("transfer_organization_ownership", {
    p_user_id: input.userId,
  });
  return mutationResult(error);
}
