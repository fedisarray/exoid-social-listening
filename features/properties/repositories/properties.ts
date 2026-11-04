import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/supabase/database.types";
import {
  listingSchema,
  type Listing,
} from "@/features/_shared/schemas/listing";
import type { Property } from "../schemas/property";
import {
  listPropertiesOutputSchema,
  type PropertySummary,
} from "../schemas/listPropertiesOutput";
type DB = SupabaseClient<Database>;
function property(row: Tables<"properties">): Property {
  return {
    id: row.id,
    listing: listingSchema.parse(row.listing),
    createdAt: row.created_at,
  };
}
export async function listOwnedProperties(db: DB): Promise<PropertySummary[]> {
  const { data, error } = await db.rpc("list_property_metrics");
  if (error) throw error;
  return listPropertiesOutputSchema.parse(data);
}
export async function findOwnedProperty(
  db: DB,
  ownerId: string,
  id: string,
): Promise<Property | null> {
  const { data, error } = await db
    .from("properties")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data ? property(data) : null;
}
export async function insertProperty(
  db: DB,
  ownerId: string,
  listing: Listing,
): Promise<Property> {
  const { error } = await db
    .from("properties")
    .upsert(
      { owner_id: ownerId, source_id: listing.sourceId, listing },
      { onConflict: "owner_id,source_id", ignoreDuplicates: true },
    );
  if (error) throw error;
  // Re-adding a removed listing restores its existing snapshots.
  const restored = await db
    .from("properties")
    .update({ deleted_at: null })
    .eq("owner_id", ownerId)
    .eq("source_id", listing.sourceId)
    .not("deleted_at", "is", null);
  if (restored.error) throw restored.error;
  const result = await db
    .from("properties")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("source_id", listing.sourceId)
    .single();
  if (result.error) throw result.error;
  return property(result.data);
}

export async function findSavedListings(
  db: DB,
  ownerId: string,
  sourceIds: string[],
): Promise<Listing[]> {
  const { data, error } = await db
    .from("properties")
    .select("listing")
    .eq("owner_id", ownerId)
    .in("source_id", sourceIds)
    .is("deleted_at", null);
  if (error) throw error;
  return data.map((row) => listingSchema.parse(row.listing));
}

export async function deleteOwnedProperty(
  db: DB,
  ownerId: string,
  id: string,
): Promise<boolean> {
  const { data, error } = await db
    .from("properties")
    .update({ deleted_at: new Date().toISOString() })
    .eq("owner_id", ownerId)
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}
