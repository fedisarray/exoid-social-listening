import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export async function deleteOrganizationAnalysis(
  db: SupabaseClient<Database>,
  id: string,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await db
    .from("analyses")
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}
