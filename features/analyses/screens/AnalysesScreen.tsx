import { WorkspaceHeader } from "@/features/_shared/components/WorkspaceHeader";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import {
  ArrowRight,
  Plus,
  Folders,
  Search,
  CalendarRange,
  SlidersHorizontal,
} from "lucide-react";
import { listAnalyses } from "../queries/listAnalyses";
import { ListingThumbnail } from "@/features/_shared/components/ListingThumbnail";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeleteAnalysisControl } from "../components/DeleteAnalysisControl";
export async function AnalysesScreen({ search = "" }: { search?: string }) {
  const [t, locale, analyses] = await Promise.all([
    getTranslations("app"),
    getLocale(),
    listAnalyses({}),
  ]);
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  const shown = analyses.filter((analysis) =>
    `${analysis.name} ${analysis.primary.label} ${analysis.primary.address}`
      .toLocaleLowerCase(locale)
      .includes(search.trim().toLocaleLowerCase(locale)),
  );
  return (
    <>
      <WorkspaceHeader>
        <form action="/analyses" className="w-full space-y-2 sm:max-w-md">
          <Label className="sr-only" htmlFor="analysis-search">
            {t("searchAnalyses")}
          </Label>
          <div className="flex gap-2">
            <Input
              id="analysis-search"
              name="q"
              defaultValue={search}
              maxLength={200}
              placeholder={t("analysisSearchPlaceholder")}
            />
            <Button
              type="submit"
              variant="outline"
              size="icon"
              aria-label={t("searchAnalyses")}
            >
              <Search className="size-4" />
            </Button>
          </div>
        </form>
      </WorkspaceHeader>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="page-title">{t("comparisons")}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {t("analysisLibraryDescription")}
          </p>
        </div>
        <Link
          data-slot="button"
          data-variant="default"
          data-size="default"
          href="/analyses/new"
          className={cn(buttonVariants())}
        >
          <Plus className="size-4" />
          {t("newAnalysis")}
        </Link>
      </div>
      {analyses.length ? (
        <>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4 exoid-panel px-4 py-3">
            <p className="font-medium">
              {t("analysisCount", { count: analyses.length })}
            </p>
          </div>
          {shown.length ? (
            <div className="mt-5 space-y-3">
              {shown.map((analysis) => (
                <article
                  key={analysis.id}
                  className="exoid-panel p-4 transition-colors hover:border-primary/30 sm:p-5"
                >
                  <div className="flex flex-wrap items-start gap-4 md:gap-5">
                    <ListingThumbnail
                      listing={analysis.primary}
                      className="size-16 md:size-20"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold break-words">
                          <Link
                            href={`/analyses/${analysis.id}/dashboard`}
                            className="rounded-sm hover:text-primary hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
                          >
                            {analysis.name}
                          </Link>
                        </h2>
                        <Badge variant="secondary">
                          {t("version")} {analysis.version}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm font-medium break-words">
                        {analysis.primary.label}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground break-words">
                        {analysis.primary.address}
                      </p>
                    </div>
                    <div className="w-full border-t pt-4 text-sm sm:w-auto sm:border-0 sm:pt-0 sm:text-right">
                      <p className="text-muted-foreground">{t("savedScope")}</p>
                      <p className="mt-1 flex items-start gap-2 font-medium tabular-nums">
                        <CalendarRange
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        {date.formatRange(
                          new Date(`${analysis.period.start}T00:00:00Z`),
                          new Date(`${analysis.period.end}T00:00:00Z`),
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                      {t("propertyCount", { count: analysis.propertyCount })}
                      <span className="mx-2" aria-hidden="true">
                        ·
                      </span>
                      {t("updated")}{" "}
                      <time dateTime={analysis.updatedAt}>
                        {date.format(new Date(analysis.updatedAt))}
                      </time>
                    </p>
                    <div className="flex w-full gap-2 sm:w-auto">
                      <DeleteAnalysisControl
                        id={analysis.id}
                        name={analysis.name}
                        labels={{
                          delete: t("deleteAnalysis"),
                          deleteNamed: t("deleteNamedAnalysis", {
                            name: analysis.name,
                          }),
                          confirmTitle: t("deleteAnalysisTitle"),
                          confirmDescription: t("deleteAnalysisDescription", {
                            name: analysis.name,
                          }),
                          cancel: t("cancel"),
                          deleteError: t("deleteAnalysisError"),
                          deleteUnavailable: t("deleteAnalysisUnavailable"),
                        }}
                      />
                      <Link
                        data-slot="button"
                        data-variant="ghost"
                        data-size="sm"
                        href={`/analyses/${analysis.id}/setup`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                        )}
                      >
                        <SlidersHorizontal className="size-4" />
                        {t("editAnalysis")}
                      </Link>
                      <Link
                        data-slot="button"
                        data-variant="outline"
                        data-size="sm"
                        href={`/analyses/${analysis.id}/dashboard`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "ml-auto",
                        )}
                        aria-label={t("openNamedAnalysis", {
                          name: analysis.name,
                        })}
                      >
                        {t("openAnalysis")}
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Search
                className="mx-auto size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-medium">
                {t("noAnalysesMatch")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("noAnalysesMatchHint")}
              </p>
              <Link
                data-slot="button"
                data-variant="outline"
                data-size="default"
                href="/analyses"
                className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
              >
                {t("clearSearch")}
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 exoid-panel border-dashed px-6 py-16 text-center">
          <Folders
            className="mx-auto size-10 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="mt-5 text-xl font-medium">
            {t("analysisEmptyTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {t("analysisEmptyDescription")}
          </p>
          <Link
            data-slot="button"
            data-variant="default"
            data-size="default"
            href="/analyses/new"
            className={cn(buttonVariants(), "mt-6")}
          >
            {t("newAnalysis")}
          </Link>
        </div>
      )}
    </>
  );
}
