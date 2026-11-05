import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";
import type { OperationContext } from "@/lib/auth/dal";
import type { Period } from "@/features/_shared/schemas/period";
import type { ComparisonAiWorkspace } from "../schemas/workspace";
import { chatMessageSchema, importSummarySchema } from "../schemas/workspace";
const MODEL = "claude-sonnet-5-5";
type DB = SupabaseClient<Database>;

export async function findComparisonAiAnalysis(
  ctx: OperationContext,
  id: string,
) {
  const { data, error } = await ctx.db
    .from("analyses")
    .select("id,current_version,organization_id")
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function prepareComparisonAiSnapshots(
  ctx: OperationContext,
  input: { analysisId: string; snapshotIds: string[] },
): Promise<{ importId: string; rowCount: number }> {
  const { data, error } = await ctx.db.rpc("prepare_comparison_ai_snapshots", {
    p_analysis: input.analysisId,
    p_snapshot_ids: input.snapshotIds,
  });
  if (error) throw error;
  const result = data[0];
  if (!result) throw new Error("NO_REVIEW_ROWS");
  return { importId: result.import_id, rowCount: result.row_count };
}

export async function listComparisonAiImports(
  db: DB,
  organizationId: string,
  analysisId: string,
): Promise<ComparisonAiWorkspace["imports"]> {
  const { data, error } = await db
    .from("comparison_ai_imports")
    .select("id,file_name,import_kind,row_count,created_at")
    .eq("organization_id", organizationId)
    .eq("analysis_id", analysisId)
    .eq("import_kind", "review_rows")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((row) =>
    importSummarySchema.parse({
      id: row.id,
      sourceLabel: row.file_name,
      kind: row.import_kind,
      rowCount: row.row_count,
      createdAt: row.created_at,
    }),
  );
}

export async function listComparisonAiMessages(
  db: DB,
  organizationId: string,
  analysisId: string,
): Promise<ComparisonAiWorkspace["messages"]> {
  const { data, error } = await db
    .from("comparison_ai_messages")
    .select(
      "id,import_id,role,content,locale,citations,visualization,period_start,period_end,created_at",
    )
    .eq("organization_id", organizationId)
    .eq("analysis_id", analysisId)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) throw error;
  if (!data.length) return [];
  const { data: jobs, error: jobsError } = await db
    .from("comparison_ai_jobs")
    .select("id,message_id,status,processed_count,total_count")
    .eq("organization_id", organizationId)
    .in(
      "message_id",
      data.map((row) => row.id),
    );
  if (jobsError) throw jobsError;
  const jobByMessage = new Map(jobs.map((job) => [job.message_id, job]));
  return data.map((row) => {
    const job = jobByMessage.get(row.id);
    return chatMessageSchema.parse({
      id: row.id,
      importId: row.import_id,
      role: row.role,
      locale: row.locale,
      content: row.content,
      citations: row.citations,
      visualization: row.visualization,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      createdAt: row.created_at,
      job: job
        ? {
            id: job.id,
            status: job.status,
            processed: job.processed_count,
            total: job.total_count,
          }
        : null,
    });
  });
}

export async function listComparisonAiConversation(
  db: DB,
  organizationId: string,
  importId: string,
  period: Period,
): Promise<{ role: "user" | "assistant"; content: string }[]> {
  const { data, error } = await db
    .from("comparison_ai_messages")
    .select("role,content")
    .eq("organization_id", organizationId)
    .eq("import_id", importId)
    .eq("period_start", period.start)
    .eq("period_end", period.end)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw error;
  return data.reverse().map((row) => ({
    role: row.role as "user" | "assistant",
    content: row.content,
  }));
}

export async function insertComparisonAiMessage(
  db: DB,
  input: TablesInsert<"comparison_ai_messages">,
): Promise<string> {
  const { data, error } = await db
    .from("comparison_ai_messages")
    .insert(input)
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function findComparisonAiImport(
  db: DB,
  organizationId: string,
  analysisId: string,
  importId: string,
): Promise<Pick<
  Tables<"comparison_ai_imports">,
  "id" | "import_kind" | "source_snapshot_ids"
> | null> {
  const { data, error } = await db
    .from("comparison_ai_imports")
    .select("id,import_kind,source_snapshot_ids")
    .eq("organization_id", organizationId)
    .eq("analysis_id", analysisId)
    .eq("id", importId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listComparisonAiReviews(
  db: DB,
  organizationId: string,
  importId: string,
  period: Period,
  limit = 50_000,
) {
  const { data, error } = await db
    .from("comparison_ai_reviews")
    .select(
      "id,sheet_name,row_number,listing_id,listing_label,published_at,rating,review_text,language,source_url",
    )
    .eq("organization_id", organizationId)
    .eq("import_id", importId)
    .gte("published_at", period.start)
    .lte("published_at", period.end)
    .order("published_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function createComparisonAiJob(
  ctx: OperationContext,
  input: {
    analysisId: string;
    importId: string;
    messageId: string;
    period: Period;
    visualizationType: string;
    total: number;
  },
): Promise<string> {
  const { data, error } = await ctx.db.rpc("enqueue_comparison_ai_job", {
    p_analysis: input.analysisId,
    p_import: input.importId,
    p_message: input.messageId,
    p_start: input.period.start,
    p_end: input.period.end,
    p_type: input.visualizationType,
    p_total: input.total,
  });
  if (error) throw error;
  return data;
}

export async function updateComparisonAiMessage(
  db: DB,
  organizationId: string,
  messageId: string,
  changes: Pick<
    TablesUpdate<"comparison_ai_messages">,
    "content" | "visualization"
  >,
): Promise<void> {
  const { error } = await db
    .from("comparison_ai_messages")
    .update(changes)
    .eq("id", messageId)
    .eq("organization_id", organizationId);
  if (error) throw error;
}

export async function findComparisonAiMessageLocale(
  db: DB,
  organizationId: string,
  messageId: string,
): Promise<"it" | "en"> {
  const { data, error } = await db
    .from("comparison_ai_messages")
    .select("locale")
    .eq("id", messageId)
    .eq("organization_id", organizationId)
    .single();
  if (error) throw error;
  return data.locale === "it" ? "it" : "en";
}

export async function wakeComparisonAiWorker(): Promise<boolean> {
  if (
    !process.env.COMPARISON_AI_WORKER_SECRET ||
    process.env.COMPARISON_AI_WORKER_SECRET.length < 32
  )
    return false;
  const { spawn } = await import("node:child_process");
  const { resolve } = await import("node:path");
  return new Promise((started) => {
    const child = spawn(
      process.execPath,
      [resolve("scripts/comparison-ai-worker.mjs")],
      {
        detached: true,
        stdio: "ignore",
        env: process.env,
      },
    );
    child.once("error", () => started(false));
    child.once("spawn", () => {
      child.unref();
      started(true);
    });
  });
}

export async function claimComparisonAiJob(db: DB) {
  const { data, error } = await db.rpc("claim_comparison_ai_job");
  if (error) throw error;
  return data[0] ?? null;
}

export async function updateComparisonAiJob(
  db: DB,
  id: string,
  lease: string,
  changes: TablesUpdate<"comparison_ai_jobs">,
) {
  const { data, error } = await db
    .from("comparison_ai_jobs")
    .update(changes)
    .eq("id", id)
    .eq("lease_token", lease)
    .gt("lease_until", new Date().toISOString())
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("COMPARISON_AI_LEASE_LOST");
}

export async function nextComparisonAiJobAttempt(
  db: DB,
): Promise<string | null> {
  const { data, error } = await db
    .from("comparison_ai_jobs")
    .select("next_attempt_at,lease_until")
    .in("status", ["queued", "running"])
    .order("next_attempt_at", { ascending: true })
    .limit(50);
  if (error) throw error;
  if (!data.length) return null;
  return new Date(
    Math.min(
      ...data.map((row) =>
        Math.max(
          Date.parse(row.next_attempt_at),
          row.lease_until ? Date.parse(row.lease_until) : 0,
        ),
      ),
    ),
  ).toISOString();
}

export async function saveComparisonAiAnnotations(
  db: DB,
  rows: TablesInsert<"comparison_ai_annotations">[],
): Promise<void> {
  const { error } = await db.from("comparison_ai_annotations").upsert(rows, {
    onConflict: "import_id,review_id,model_version",
    ignoreDuplicates: true,
  });
  if (error) throw error;
}

export async function listComparisonAiAnnotations(
  db: DB,
  organizationId: string,
  importId: string,
) {
  const { data, error } = await db
    .from("comparison_ai_annotations")
    .select("review_id,sentiment,themes,model_version")
    .eq("organization_id", organizationId)
    .eq("import_id", importId)
    .eq("model_version", MODEL);
  if (error) throw error;
  return data;
}

export async function findComparisonAiJob(
  db: DB,
  organizationId: string,
  jobId: string,
) {
  const { data, error } = await db
    .from("comparison_ai_jobs")
    .select("id,status,processed_count,total_count,error_code")
    .eq("organization_id", organizationId)
    .eq("id", jobId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export { MODEL as comparisonAiModel };
