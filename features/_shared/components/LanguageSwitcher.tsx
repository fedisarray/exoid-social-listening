"use client";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/features/auth/actions/setLocale";
import { Button } from "@/components/ui/button";
export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("app");
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      aria-label={t("language")}
      onClick={() =>
        start(async () => {
          await setLocale(locale === "it" ? "en" : "it");
          router.refresh();
        })
      }
    >
      {locale === "it" ? "English" : "Italiano"}
    </Button>
  );
}
