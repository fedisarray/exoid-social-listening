"use server";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/dal";
import { signOut as execute } from "../use-cases/signOut";
export async function signOut(): Promise<void> {
  const ctx = await requireAuthenticatedUser();
  await execute(ctx);
  redirect("/login");
}
