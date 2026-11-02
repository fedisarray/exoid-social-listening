import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { ArrowUpRight, Plus, Building2 } from "lucide-react";
import { listAnalyses } from "../queries/listAnalyses";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export async function AnalysesScreen() {
  const [t, locale, analyses] = await Promise.all([
    getTranslations("app"),
    getLocale(),
    listAnalyses({}),
  ]);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="page-title">{t("analysesTitle")}</h1>
          <p className="mt-3 text-muted-foreground">
            {t("analysesDescription")}
          </p>
        </div>
        <Link href="/analyses/new" className={cn(buttonVariants())}>
          <Plus className="size-4" />
          {t("newAnalysis")}
        </Link>
      </div>
      {analyses.length ? (
        <div className="mt-10 divide-y border-y">
          {analyses.map((x) => (
            <Link
              href={`/analyses/${x.id}/dashboard`}
              key={x.id}
              className="group flex items-center gap-4 py-6"
            >
              <div className="rounded-xl bg-secondary p-3">
                <Building2 className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-medium group-hover:text-primary">
                  {x.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("version")} {x.version} · {t("updated")}{" "}
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                  }).format(new Date(x.updatedAt))}
                </p>
              </div>
              <ArrowUpRight className="size-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-xl border border-dashed px-6 py-20 text-center">
          <Building2 className="mx-auto size-10 text-primary" />
          <h2 className="mt-5 text-xl font-medium">{t("emptyTitle")}</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {t("emptyDescription")}
          </p>
          <Link
            href="/analyses/new"
            className={cn(buttonVariants({ variant: "outline" }), "mt-7")}
          >
            {t("newAnalysis")}
          </Link>
        </div>
      )}
    </>
  );
}
