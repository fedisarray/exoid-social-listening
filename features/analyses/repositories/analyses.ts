import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, Tables } from "@/lib/supabase/database.types";
import type {
  AnalysisDetail,
  AnalysisSummary,
} from "../schemas/analysisDetail";
import type { SaveAnalysisInput } from "../schemas/saveAnalysisInput";
import { analysisConfigSchema } from "../schemas/analysisConfig";
type DB = SupabaseClient<Database>;
function summary(row: Tables<"analyses">): AnalysisSummary {
  return {
    id: row.id,
    name: row.name,
    version: row.current_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
export async function listOwnedAnalyses(
  db: DB,
  ownerId: string,
): Promise<AnalysisSummary[]> {
  const { data, error } = await db
    .from("analyses")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data.map(summary);
}
export async function findOwnedAnalysis(
  db: DB,
  id: string,
  ownerId: string,
): Promise<AnalysisDetail | null> {
  const { data, error } = await db
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const version = await db
    .from("analysis_versions")
    .select("config")
    .eq("analysis_id", id)
    .eq("version", data.current_version)
    .single();
  if (version.error) throw version.error;
  return {
    ...summary(data),
    config: analysisConfigSchema.parse(version.data.config),
  };
}
export async function persistAnalysis(
  db: DB,
  input: SaveAnalysisInput,
): Promise<{ id: string | null; conflict: boolean }> {
  const config: Json = input.config;
  const { data, error } = await db.rpc("save_analysis", {
    p_id: input.id ?? crypto.randomUUID(),
    p_name: input.name,
    p_config: config,
    p_expected: input.expectedVersion,
  });
  if (error) {
    if (error.message.includes("VERSION_CONFLICT"))
      return { id: null, conflict: true };
    throw error;
  }
  return { id: data, conflict: false };
}
