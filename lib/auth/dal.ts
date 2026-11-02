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
