"use client";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Building2,
  MessageSquare,
  ArrowLeft,
  SlidersHorizontal,
} from "lucide-react";
import { periodSchema } from "../schemas/analysisConfig";
import type { AnalysisDetail } from "../schemas/analysisDetail";
import { resolvePeriod } from "../domain/period";
import { PeriodFields } from "../components/PeriodFields";
import { Choice } from "@/features/_shared/components/Choice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
export function AnalysisDashboard({ analysis }: { analysis: AnalysisDetail }) {
  const t = useTranslations("app");
  const router = useRouter();
  const path = usePathname();
  const search = useSearchParams();
  const saved = analysis.config.period;
  const params = Object.fromEntries(search.entries());
  const year = Number(params.year ?? saved.year);
  const quarter = Number(params.quarter ?? saved.quarter);
  const candidate = periodSchema.safeParse({
    ...saved,
    kind: params.kind ?? saved.kind,
    year,
    quarter,
    cutoff: params.cutoff ?? saved.cutoff,
    start: params.start ?? saved.start,
    end: params.end ?? saved.end,
  });
  const period = resolvePeriod(candidate.success ? candidate.data : saved);
  const role = ["primary", "additionalOwn", "competitor", "anchor"].includes(
    params.role,
  )
    ? params.role
    : "all";
  const listings = analysis.config.listings.filter(
    (x) => role === "all" || x.role === role,
  );
  function update(patch: Record<string, string>) {
    const next = new URLSearchParams(search.toString());
    Object.entries(patch).forEach(([k, v]) => next.set(k, v));
    router.replace(`${path}?${next}`, { scroll: false });
  }
  return (
    <>
      <Link
        href="/analyses"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("back")}
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="secondary">
            {t("version")} {analysis.version}
          </Badge>
          <h1 className="page-title mt-3 break-words">{analysis.name}</h1>
          <p className="mt-3 text-muted-foreground">
            {t("dashboardDescription")}
          </p>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "outline" }))}
          href={`/analyses/${analysis.id}/setup`}
        >
          <SlidersHorizontal className="size-4" />
          {t("setup")}
        </Link>
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <h2 className="font-semibold">{t("properties")}</h2>
            <div className="w-full sm:w-60">
              <Choice
                label={t("role")}
                value={role}
                onChange={(role) => update({ role })}
                options={[
                  "all",
                  "primary",
                  "additionalOwn",
                  "competitor",
                  "anchor",
                ].map((value) => ({ value, label: t(value) }))}
              />
            </div>
          </div>
          <div className="divide-y">
            {listings.map((listing) => (
              <div
                key={listing.sourceId}
                className="flex items-start gap-3 py-5"
              >
                <Building2 className="mt-1 size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium break-words">{listing.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground break-words">
                    {listing.address}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="h-auto min-h-5 max-w-32 whitespace-normal text-center"
                >
                  {t(listing.role)}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-dashed p-7">
            <MessageSquare className="size-7 text-primary" />
            <h2 className="mt-4 text-xl font-medium">{t("notCollected")}</h2>
            <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
              {t("notCollectedDescription")}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("reportPending")}
            </p>
          </div>
        </section>
        <aside className="self-start rounded-xl border bg-card p-5">
          <h2 className="font-semibold">{t("savedScope")}</h2>
          <p className="mb-5 mt-2 text-sm tabular-nums text-muted-foreground">
            {saved.start} — {saved.end}
          </p>
          <h3 className="mb-4 border-t pt-5 font-medium">{t("explore")}</h3>
          <PeriodFields
            value={period}
            onChange={(value) =>
              update(
                Object.fromEntries(
                  Object.entries(value).map(([k, v]) => [k, String(v)]),
                ),
              )
            }
          />
          <p className="mt-4 text-sm text-muted-foreground">
            {t("exploreHint")}
          </p>
          <Button
            type="button"
            variant="ghost"
            className="mt-4 w-full"
            onClick={() => router.replace(path, { scroll: false })}
          >
            {t("reset")}
          </Button>
        </aside>
      </div>
    </>
  );
}
