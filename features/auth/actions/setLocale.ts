"use server";
import { cookies } from "next/headers";
import { setLocaleInputSchema } from "../schemas/setLocaleInput";
import { setLocale as execute } from "../use-cases/setLocale";
export async function setLocale(raw: unknown): Promise<void> {
  const input = setLocaleInputSchema.parse(raw);
  const preference = execute(input);
  const store = await cookies();
  store.set(preference.name, preference.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 31536000,
  });
}
