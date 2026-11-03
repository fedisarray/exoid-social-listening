import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
export const requireUser = cache(async () => {
  const db = await createSupabaseServer();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) redirect("/login");
  return { userId: data.user.id, email: data.user.email ?? "", db };
});
export type OperationContext = Awaited<ReturnType<typeof requireUser>>;

// This context is only constructed after authenticating the internal worker.
export async function requireCollectionWorker(authorization: string | null) {
  const { timingSafeEqual } = await import("node:crypto");
  const secret = process.env.COLLECTION_WORKER_SECRET;
  if (!secret || secret.length < 32) return null;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization ?? "");
  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  )
    return null;
  const { createSupabaseAdmin } = await import("@/lib/supabase/admin");
  const db = createSupabaseAdmin();
  return { db };
}
export type CollectionWorkerContext = NonNullable<
  Awaited<ReturnType<typeof requireCollectionWorker>>
>;
