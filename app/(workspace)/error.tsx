"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("app");
  return (
    <div role="alert" className="space-y-5">
      <h1 className="text-xl">{t("loadError")}</h1>
      <Button onClick={reset}>{t("tryAgain")}</Button>
    </div>
  );
}
