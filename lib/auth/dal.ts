import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { OrganizationMembership } from "@/features/organizations/schemas/organizationMembership";
import { findOrganizationMembership } from "@/features/organizations/repositories/organizations";

export type AuthenticatedContext = {
  userId: string;
  email: string;
  db: SupabaseClient<Database>;
};
export type OperationContext = AuthenticatedContext & OrganizationMembership;

export const requireAuthenticatedUser = cache(
  async (): Promise<AuthenticatedContext> => {
    const db = await createSupabaseServer();
    const { data, error } = await db.auth.getUser();
    if (error || !data.user) redirect("/login");
    return { userId: data.user.id, email: data.user.email ?? "", db };
  },
);
export const requireUser = cache(async (): Promise<OperationContext> => {
  const user = await requireAuthenticatedUser();
  const membership = await findOrganizationMembership(user.db, user.userId);
  if (!membership) redirect("/organization-required");
  return { ...user, ...membership };
});

// This context is only constructed after authenticating the internal worker.
async function requireInternalWorker(
  authorization: string | null,
  secret: string | undefined,
) {
  const { timingSafeEqual } = await import("node:crypto");
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
export async function requireCollectionWorker(authorization: string | null) {
  return requireInternalWorker(
    authorization,
    process.env.COLLECTION_WORKER_SECRET,
  );
}
export async function requireReportWorker(authorization: string | null) {
  return requireInternalWorker(authorization, process.env.REPORT_WORKER_SECRET);
}
export async function requireComparisonAiWorker(authorization: string | null) {
  return requireInternalWorker(
    authorization,
    process.env.COMPARISON_AI_WORKER_SECRET,
  );
}
export type ReportWorkerContext = NonNullable<
  Awaited<ReturnType<typeof requireReportWorker>>
>;
export type ComparisonAiWorkerContext = NonNullable<
  Awaited<ReturnType<typeof requireComparisonAiWorker>>
>;
export type CollectionWorkerContext = NonNullable<
  Awaited<ReturnType<typeof requireCollectionWorker>>
>;
