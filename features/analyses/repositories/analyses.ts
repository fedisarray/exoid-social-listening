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
function summary(row: Tables<"analyses">): Omit<AnalysisDetail, "config"> {
  return {
    id: row.id,
    name: row.name,
    version: row.current_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
export async function listOrganizationAnalyses(
  db: DB,
  organizationId: string,
): Promise<AnalysisSummary[]> {
  const { data, error } = await db
    .from("analyses")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  if (!data.length) return [];
  const batches = [];
  for (let offset = 0; offset < data.length; offset += 100) {
    const rows = data.slice(offset, offset + 100);
    batches.push(rows);
  }
  const versions = await Promise.all(
    batches.map(async (rows) => {
      const filters = rows
        .map(
          (row) =>
            `and(analysis_id.eq.${row.id},version.eq.${row.current_version})`,
        )
        .join(",");
      const result = await db
        .from("analysis_versions")
        .select("analysis_id,version,config")
        .or(filters);
      if (result.error) throw result.error;
      return result.data;
    }),
  );
  const configs = new Map(
    versions
      .flat()
      .map((row) => [`${row.analysis_id}:${row.version}`, row.config]),
  );
  return data.map((row) => {
    const config = analysisConfigSchema.parse(
      configs.get(`${row.id}:${row.current_version}`),
    );
    const primary = config.listings.find(
      (listing) => listing.role === "primary",
    );
    if (!primary) throw new Error("PRIMARY_REQUIRED");
    return {
      ...summary(row),
      primary,
      period: config.period,
      propertyCount: config.listings.length,
    };
  });
}
export async function findOrganizationAnalysis(
  db: DB,
  id: string,
  organizationId: string,
): Promise<AnalysisDetail | null> {
  const { data, error } = await db
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
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
