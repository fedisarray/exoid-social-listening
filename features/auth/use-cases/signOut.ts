import "server-only";
import type { AuthenticatedContext } from "@/lib/auth/dal";
import { removeSession } from "../repositories/session";
export async function signOut(ctx: AuthenticatedContext): Promise<void> {
  await removeSession(ctx.db);
}
