import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import { removeSession } from "../repositories/session";
export async function signOut(ctx: OperationContext): Promise<void> {
  await removeSession(ctx.db);
}
