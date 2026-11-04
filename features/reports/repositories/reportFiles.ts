import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
type DB = SupabaseClient<Database>;
export async function saveReportFile(
  db: DB,
  path: string,
  bytes: Uint8Array,
): Promise<void> {
  const { error } = await db.storage
    .from("comparison-reports")
    .upload(path, bytes, {
      contentType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      upsert: false,
    });
  // A stale worker must never replace a published file; retries can reuse this job's existing object.
  if (
    error &&
    !("status" in error && error.status === 409) &&
    !("statusCode" in error && String(error.statusCode) === "409")
  )
    throw error;
}
export async function createReportDownload(
  db: DB,
  path: string,
  filename: string,
): Promise<string> {
  const { data, error } = await db.storage
    .from("comparison-reports")
    .createSignedUrl(path, 60, { download: filename });
  if (error) throw error;
  return data.signedUrl;
}
