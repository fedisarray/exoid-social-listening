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
export async function listOrganizationProperties(
  db: DB,
): Promise<PropertySummary[]> {
  const { data, error } = await db.rpc("list_property_metrics");
  if (error) throw error;
  return listPropertiesOutputSchema.parse(data);
}
export async function findOrganizationProperty(
  db: DB,
  organizationId: string,
  id: string,
): Promise<Property | null> {
  const { data, error } = await db
    .from("properties")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data ? property(data) : null;
}
export async function insertProperty(
  db: DB,
  organizationId: string,
  listing: Listing,
): Promise<Property> {
  const { error } = await db
    .from("properties")
    .upsert(
      { organization_id: organizationId, source_id: listing.sourceId, listing },
      { onConflict: "organization_id,source_id", ignoreDuplicates: true },
    );
  if (error) throw error;
  // Re-adding a removed listing restores its existing snapshots.
  const restored = await db
    .from("properties")
    .update({ deleted_at: null })
    .eq("organization_id", organizationId)
    .eq("source_id", listing.sourceId)
    .not("deleted_at", "is", null);
  if (restored.error) throw restored.error;
  const result = await db
    .from("properties")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("source_id", listing.sourceId)
    .single();
  if (result.error) throw result.error;
  return property(result.data);
}

export async function findSavedListings(
  db: DB,
  organizationId: string,
  sourceIds: string[],
): Promise<Listing[]> {
  const { data, error } = await db
    .from("properties")
    .select("listing")
    .eq("organization_id", organizationId)
    .in("source_id", sourceIds)
    .is("deleted_at", null);
  if (error) throw error;
  return data.map((row) => listingSchema.parse(row.listing));
}

export async function deleteOrganizationProperty(
  db: DB,
  organizationId: string,
  id: string,
): Promise<boolean> {
  const { data, error } = await db
    .from("properties")
    .update({ deleted_at: new Date().toISOString() })
    .eq("organization_id", organizationId)
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}
