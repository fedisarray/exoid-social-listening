import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export async function deleteOwnedAnalysis(
  db: SupabaseClient<Database>,
  id: string,
  ownerId: string,
): Promise<boolean> {
  const { data, error } = await db
    .from("analyses")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}
