import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { it } from "@/features/_shared/locales/it";
import { en } from "@/features/_shared/locales/en";
export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get("locale")?.value === "en" ? "en" : "it";
  return { locale, messages: locale === "it" ? it : en };
});
