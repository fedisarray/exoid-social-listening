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
export async function findLatestRun(
  db: DB,
  organizationId: string,
): Promise<Tables<"discovery_runs"> | null> {
  const { data, error } = await db
    .from("discovery_runs")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
export async function insertRun(
  db: DB,
  organizationId: string,
  input: StartDiscoveryInput,
): Promise<Tables<"discovery_runs">> {
  const { data, error } = await db
    .from("discovery_runs")
    .insert({ organization_id: organizationId, input, status: "queued" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function findRun(
  db: DB,
  organizationId: string,
  id: string,
): Promise<Tables<"discovery_runs"> | null> {
  const { data, error } = await db
    .from("discovery_runs")
    .select("*")
    .eq("organization_id", organizationId)
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
  organizationId: string,
): Promise<Listing[]> {
  const { data, error } = await db
    .from("discovery_runs")
    .select("results")
    .eq("organization_id", organizationId)
    .eq("status", "completed")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.flatMap((row) => listingSchema.array().parse(row.results));
}
