import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Tables,
  TablesUpdate,
} from "@/lib/supabase/database.types";
import {
  listingSchema,
  type Listing,
} from "@/features/_shared/schemas/listing";
import type { StartDiscoveryInput } from "../schemas/startDiscoveryInput";
type DB = SupabaseClient<Database>;
export async function insertRun(
  db: DB,
  userId: string,
  input: StartDiscoveryInput,
): Promise<Tables<"discovery_runs">> {
  const { data, error } = await db
    .from("discovery_runs")
    .insert({ owner_id: userId, input, status: "queued" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function findRun(
  db: DB,
  userId: string,
  id: string,
): Promise<Tables<"discovery_runs"> | null> {
  const { data, error } = await db
    .from("discovery_runs")
    .select("*")
    .eq("owner_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
export async function updateRun(
  db: DB,
  id: string,
  changes: TablesUpdate<"discovery_runs">,
): Promise<Tables<"discovery_runs">> {
  const { data, error } = await db
    .from("discovery_runs")
    .update(changes)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function readConfirmedListings(
  db: DB,
  userId: string,
): Promise<Listing[]> {
  const { data, error } = await db
    .from("discovery_runs")
    .select("results")
    .eq("owner_id", userId)
    .eq("status", "completed");
  if (error) throw error;
  return data.flatMap((row) => listingSchema.array().parse(row.results));
}
