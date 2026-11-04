"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("app");
  return (
    <div role="alert" className="exoid-panel max-w-2xl space-y-5 p-6">
      <h1 className="page-title">{t("loadError")}</h1>
      <Button onClick={reset}>{t("tryAgain")}</Button>
    </div>
  );
}
