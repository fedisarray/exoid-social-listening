import { reportsIT } from "@/features/reports/locales/it";
import { reportsEN } from "@/features/reports/locales/en";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { it } from "@/features/_shared/locales/it";
import { en } from "@/features/_shared/locales/en";
import { reviewsEN } from "@/features/reviews/locales/en";
import { reviewsIT } from "@/features/reviews/locales/it";
import { comparisonAiEN } from "@/features/comparison-ai/locales/en";
import { comparisonAiIT } from "@/features/comparison-ai/locales/it";
import { propertiesEN } from "@/features/properties/locales/en";
import { propertiesIT } from "@/features/properties/locales/it";
export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get("locale")?.value === "en" ? "en" : "it";
  return {
    locale,
    messages:
      locale === "it"
        ? {
            ...it,
            reviews: reviewsIT,
            properties: propertiesIT,
            reports: reportsIT,
            comparisonAi: comparisonAiIT,
          }
        : {
            ...en,
            reviews: reviewsEN,
            properties: propertiesEN,
            reports: reportsEN,
            comparisonAi: comparisonAiEN,
          },
  };
});
