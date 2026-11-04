import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { it } from "@/features/_shared/locales/it";
import { en } from "@/features/_shared/locales/en";
import { reviewsEN } from "@/features/reviews/locales/en";
import { reviewsIT } from "@/features/reviews/locales/it";
import { propertiesEN } from "@/features/properties/locales/en";
import { propertiesIT } from "@/features/properties/locales/it";
export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get("locale")?.value === "en" ? "en" : "it";
  return {
    locale,
    messages:
      locale === "it"
        ? { ...it, reviews: reviewsIT, properties: propertiesIT }
        : { ...en, reviews: reviewsEN, properties: propertiesEN },
  };
});
