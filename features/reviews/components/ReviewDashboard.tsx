"use client";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Download,
  RefreshCw,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  Star,
} from "lucide-react";
import { ReviewCoverage } from "./ReviewCoverage";
import { PropertyTrends } from "./PropertyTrends";
import { ReviewIndicators } from "./ReviewIndicators";
import { ComparisonTrends } from "./ComparisonTrends";
import { SharedReviewersComparison } from "./SharedReviewersComparison";
import { useReviewDashboard } from "../hooks/useReviewDashboard";
import type { GetReviewDashboardInput } from "../schemas/getReviewDashboardInput";
import type { ReviewDashboard as DashboardData } from "../schemas/getReviewDashboardOutput";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Choice } from "@/features/_shared/components/Choice";
import type { Selection } from "@/features/analyses/schemas/analysisConfig";
import { AnalysisComparisonTable } from "./AnalysisComparisonTable";
import { PropertyReviewCard } from "./PropertyReviewCard";
import { Label } from "@/components/ui/label";
import { PeriodFields } from "@/features/analyses/components/PeriodFields";
type ReviewDashboardProps = {
  section?: string;
  onCollect?: (event: MouseEvent<HTMLButtonElement>) => void;
  collectionDialog?: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCloseAutoFocus: () => void;
    onPeriodChange: (period: GetReviewDashboardInput["period"]) => void;
  };
  input: GetReviewDashboardInput;
  initial: { input: GetReviewDashboardInput; data: DashboardData };
  version: number;
  listings: Selection[];
  role: string;
  onSnapshot: (id: string) => void;
};

export function ReviewDashboard(props: ReviewDashboardProps) {
  const dashboard = useReviewDashboard(props.input, props.initial);
  return <ReviewDashboardContent {...props} dashboard={dashboard} />;
}

export function ReviewDashboardContent({
  section = "all",
  onCollect,
  collectionDialog,
  input,
  version,
  listings,
  role,
  onSnapshot,
  dashboard,
}: ReviewDashboardProps & {
  dashboard: ReturnType<typeof useReviewDashboard>;
}) {
  const t = useTranslations("reviews");
  const app = useTranslations("app");
  const locale = useLocale();
  const { query, collect, ensure } = dashboard;
  const [limit, setLimit] = useState("10000");
  const data = query.data;
  const active = Boolean(
    data?.coverage.some((state) => state.activeRun) ||
    (data?.run && ["queued", "running"].includes(data.run.status)),
  );
  const properties =
    data?.metrics?.properties.filter(
      (p) => role === "all" || p.role === role,
    ) ?? [];
  const cards = data?.metrics
    ? properties.map((metric) => ({
        id: metric.listingId,
        label: metric.label,
        role: metric.role,
        metric,
        listing: listings.find(
          (listing) => listing.sourceId === metric.listingId,
        ),
        status: metric.status,
      }))
    : listings
        .filter((listing) => role === "all" || listing.role === role)
        .map((listing) => ({
          id: listing.sourceId,
          label: listing.label,
          role: listing.role,
          listing,
          metric: undefined,
          status:
            data?.run?.version === version
              ? data.run.sources.find(
                  (source) => source.listingId === listing.sourceId,
                )?.status
              : undefined,
        }));
  const ids = new Set(properties.map((p) => p.listingId));
  const labels = new Map(
    data?.metrics?.properties.map((p) => [p.listingId, p.label]) ?? [],
  );
  const number = (v: number | null, digits = 0) =>
    v === null
      ? "—"
      : new Intl.NumberFormat(locale, {
          maximumFractionDigits: digits,
          minimumFractionDigits: digits,
        }).format(v);
  const date = (v: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(v));
  const propertyCards = (
    <div className="mt-4 grid gap-4" aria-busy={query.isPending}>
      {input.propertyId && data?.metrics && !data.comparisonReady ? (
        <p className="text-sm text-muted-foreground">
          {t("partialPropertyMetrics")}
        </p>
      ) : null}
      {cards.map((card) => (
        <PropertyReviewCard
          key={card.id}
          {...card}
          showIdentity={!input.propertyId}
          role={input.propertyId ? undefined : card.role}
          loading={query.isPending}
          covered={
            data?.coverage.find((state) => state.listingId === card.id)?.covered
          }
          collectionPeriod={
            data?.snapshot
              ? { start: data.snapshot.start, end: data.snapshot.end }
              : null
          }
          ratingTrend={data?.metrics?.monthly.filter(
            (point) => point.listingId === card.id,
          )}
        />
      ))}
    </div>
  );
  const collectionControls = (
    <div
      hidden={
        !collectionDialog?.open && section !== "all" && section !== "collection"
      }
    >
      <div className="mt-7 flex flex-wrap items-end gap-3 border-t pt-6">
        {input.propertyId ? (
          <div className="min-w-48 flex-1 space-y-2">
            <Label htmlFor="review-limit">{t("limit")}</Label>
            <Choice
              id="review-limit"
              label={t("limit")}
              value={limit}
              disabled={active || collect.isPending}
              onChange={setLimit}
              options={["100", "1000", "5000", "10000"].map((v) => ({
                value: v,
                label: number(Number(v)),
              }))}
            />
          </div>
        ) : null}
        <Button
          type="button"
          disabled={
            active ||
            collect.isPending ||
            Boolean(input.analysisId && !data?.comparisonReady)
          }
          onClick={() => collect.mutate(Number(limit))}
        >
          {active ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {t(
            !input.propertyId
              ? collect.isPending
                ? "preparingSnapshot"
                : "prepareSnapshot"
              : collect.isPending
                ? "startingCollection"
                : data?.coverage.some((state) => state.collections.length)
                  ? "refresh"
                  : "collect",
          )}
        </Button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {t(input.propertyId ? "collectHint" : "reuseHint")} {t("propertyCount")}
        : {listings.length}.
      </p>
      {!input.propertyId ? (
        <Link
          href="/properties"
          className="mt-2 inline-block text-sm text-primary underline underline-offset-4"
        >
          {t("manageProperties")}
        </Link>
      ) : null}
      {collect.isError ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {t(
            collect.error.message === "COMPARISON_COVERAGE_INCOMPLETE"
              ? "freezeIncomplete"
              : collect.error.message === "PROPERTIES_NOT_COLLECTED"
                ? "propertiesNotCollected"
                : collect.error.message === "APIFY_NOT_CONFIGURED"
                  ? "apifyMissing"
                  : collect.error.message === "WORKER_NOT_CONFIGURED"
                    ? "workerMissing"
                    : "collectionError",
          )}
        </p>
      ) : null}
      {data?.run ? (
        <section
          aria-live="polite"
          className="mt-5 rounded-xl border bg-card p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium">
              {t("collection")} · {t("version")} {data.run.version}
            </span>
            <Badge
              variant={
                data.run.status === "failed" ? "destructive" : "secondary"
              }
            >
              {t(data.run.status)}
            </Badge>
          </div>
          {active ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {t("workerActive")}
            </p>
          ) : null}
          {data.workerStalled ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {t("stalled")}
            </p>
          ) : null}
          <div className="mt-3 space-y-3">
            {data.run.sources.map((s) => (
              <details key={s.id} className="border-t pt-3">
                <summary className="cursor-pointer text-sm">
                  <span className="font-medium">{s.label}</span> · {t(s.status)}{" "}
                  · {number(s.accepted)} {t("reviews")}
                </summary>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {[
                    [t("returned"), s.returned],
                    [t("accepted"), s.accepted],
                    [t("skipped"), s.skipped],
                    [t("duplicates"), s.duplicates],
                    [t("missingIds"), s.missingIds],
                    [t("missingReviewers"), s.missingReviewers],
                  ].map(([k, v]) => (
                    <p key={k}>
                      {k}: {typeof v === "number" ? number(v) : v}
                    </p>
                  ))}
                  <p className="sm:col-span-2">
                    {t("observedRange")}: {s.earliest?.slice(0, 10) ?? "—"} /{" "}
                    {s.latest?.slice(0, 10) ?? "—"}
                  </p>
                  {s.providerBuildId ? (
                    <p>
                      {t("providerVersion")}: {s.providerBuildId}
                    </p>
                  ) : null}
                  {s.error ? (
                    <p className="break-words text-destructive">
                      {t("error")}:{" "}
                      {t.has(`providerErrors.${s.error}`)
                        ? t(`providerErrors.${s.error}`)
                        : s.error}
                    </p>
                  ) : null}
                  {s.capped ? (
                    <p className="text-destructive sm:col-span-2">{t("cap")}</p>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </section>
      ) : null}
      {data?.snapshots.length ? (
        <div className="mt-6 space-y-2">
          <Label htmlFor="review-snapshot">{t("history")}</Label>
          <Choice
            id="review-snapshot"
            label={t("history")}
            value={input.snapshotId ?? "latest"}
            onChange={onSnapshot}
            options={[
              { value: "latest", label: t("latest") },
              ...data.snapshots.map((s) => ({
                value: s.id,
                label: `${date(s.createdAt)} · v${s.version}`,
              })),
            ]}
          />
        </div>
      ) : null}
    </div>
  );
  return (
    <div className="flex min-w-0 flex-col">
      {!input.propertyId && !input.analysisId ? (
        <p className="mt-4 text-sm tabular-nums text-muted-foreground">
          {t("selected")} · {input.period.start} — {input.period.end} (UTC)
        </p>
      ) : null}
      {data ? (
        <Collapsible
          key={String(data.comparisonReady)}
          defaultOpen={false}
          className={
            section === "evidence"
              ? "order-last mt-6 rounded-lg border bg-card"
              : "mt-4 rounded-lg border bg-card"
          }
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto w-full justify-between gap-3 px-4 py-3 text-left whitespace-normal"
            >
              <span>{t("coverageTitle")}</span>
              <span className="flex items-center gap-2">
                <Badge variant={data.comparisonReady ? "secondary" : "outline"}>
                  {t(data.comparisonReady ? "coverageReady" : "coverageCheck")}
                </Badge>
                <ChevronDown className="size-4 shrink-0" />
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <ReviewCoverage
              coverage={data.coverage}
              ready={data.comparisonReady}
              frozen={data.mode === "frozen"}
              pending={ensure.isPending}
              error={ensure.isError}
              onRetry={
                input.analysisId
                  ? () =>
                      ensure.mutate({
                        analysisId: input.analysisId!,
                        period: input.period,
                        retry: true,
                      })
                  : undefined
              }
            />
          </CollapsibleContent>
        </Collapsible>
      ) : null}
      {data?.snapshot ? (
        <details className="mt-4 rounded-xl border bg-card px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium">
            {t("scopeTitle")}
          </summary>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            {t("scopeExplanation")}
          </p>
          <p className="mt-3 tabular-nums text-muted-foreground">
            {t("savedCoverage")}: {data.snapshot.start} — {data.snapshot.end}{" "}
            (UTC)
          </p>
        </details>
      ) : null}
      {input.analysisId &&
      data?.snapshot &&
      data.snapshot.version !== version ? (
        <p
          role="status"
          className="mt-4 rounded-lg border bg-accent p-4 text-sm leading-relaxed text-accent-foreground"
        >
          {t("historicalSnapshotNotice", {
            snapshotVersion: data.snapshot.version,
            currentVersion: version,
          })}
        </p>
      ) : null}
      {data && (section === "all" || section === "overview") ? (
        <ReviewIndicators data={data} role={role} />
      ) : null}
      <div hidden={section !== "all" && section !== "overview"}>
        {input.analysisId ? (
          <>
            <AnalysisComparisonTable
              properties={cards}
              loading={query.isPending}
            />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {app("comparisonHint")}
            </p>
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium">
                {app("propertyDetails")}
              </summary>
              {propertyCards}
            </details>
          </>
        ) : (
          propertyCards
        )}
        {cards.length === 0 && !query.isPending ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("noProperties")}
          </p>
        ) : null}
      </div>
      <Dialog
        open={collectionDialog?.open ?? false}
        onOpenChange={collectionDialog?.onOpenChange}
      >
        <DialogContent
          showCloseButton={false}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            collectionDialog?.onCloseAutoFocus();
          }}
          className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"
        >
          <DialogHeader>
            <DialogTitle>{t("collect")}</DialogTitle>
            <DialogDescription>
              {t("selected")} · {input.period.start} — {input.period.end} (UTC)
            </DialogDescription>
          </DialogHeader>
          {collectionDialog ? (
            <PeriodFields
              value={input.period}
              onChange={collectionDialog.onPeriodChange}
            />
          ) : null}
          {collectionControls}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("close")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {!collectionDialog ? collectionControls : null}
      {query.isError ? (
        <div role="alert" className="mt-3">
          <p className="text-sm text-destructive">{t("loadError")}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => query.refetch()}
          >
            {t("retry")}
          </Button>
        </div>
      ) : null}
      {query.isPending ? <Skeleton className="mt-6 h-48 w-full" /> : null}
      {input.analysisId &&
      data &&
      (section === "trends" || section === "all") ? (
        <ComparisonTrends period={input.period} role={role} data={data} />
      ) : null}
      {data?.metrics ? (
        <>
          <div
            hidden={Boolean(
              input.propertyId && section === "trends" && !data.snapshot,
            )}
            className="mt-6 text-sm text-muted-foreground"
          >
            {data.snapshot ? (
              <>
                <p>
                  {t("collected")}: {date(data.snapshot.createdAt)} ·{" "}
                  {t("version")} {data.snapshot.version}
                </p>
                <p className="mt-1">
                  {t("snapshotDates")}: {data.snapshot.start} —{" "}
                  {data.snapshot.end} (UTC)
                </p>
              </>
            ) : null}
            {section !== "shared" &&
            !(input.propertyId && section === "trends") ? (
              <p className="mt-3 leading-relaxed">{t("coverage")}</p>
            ) : null}
            {data.snapshot &&
            (input.period.start < data.snapshot.start ||
              input.period.end > data.snapshot.end) ? (
              <p className="mt-3 text-destructive">{t("outOfRange")}</p>
            ) : null}
          </div>
          {input.propertyId && (section === "trends" || section === "all") ? (
            <PropertyTrends data={data} period={input.period} />
          ) : null}
          <div hidden={section !== "all" && section !== "shared"}>
            <SharedReviewersComparison
              metrics={data.metrics}
              listings={listings}
              role={role}
            />
          </div>
          <section
            hidden={section !== "all" && section !== "evidence"}
            className="mt-5"
          >
            <h3 className="text-lg font-semibold">{t("evidence")}</h3>
            <div className="mt-4 space-y-3">
              {data.metrics.samples
                .filter((r) => ids.has(r.listingId))
                .map((r, i) => (
                  <article key={i} className="rounded-xl border bg-card p-5">
                    <div className="flex flex-wrap gap-2 text-sm">
                      <Badge variant="secondary">
                        <Star className="size-3" aria-hidden="true" />
                        {number(r.rating)} / 5
                      </Badge>
                      {!input.propertyId ? (
                        <span className="font-medium">
                          {labels.get(r.listingId)}
                        </span>
                      ) : null}
                      <span className="text-muted-foreground">
                        {new Intl.DateTimeFormat(locale, {
                          dateStyle: "medium",
                          timeZone: "UTC",
                        }).format(new Date(r.publishedAt))}{" "}
                        {r.language ? ` · ${r.language}` : ""}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {r.text || t("ratingOnly")}
                    </p>
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm text-primary"
                      >
                        {t("source")}
                        <ExternalLink className="size-3" />
                      </a>
                    ) : null}
                  </article>
                ))}
            </div>
          </section>
          <details className="mt-6 text-xs text-muted-foreground">
            <summary className="cursor-pointer">{t("dataNotes")}</summary>
            {input.propertyId && section === "trends" ? (
              <p className="mt-2">{t("coverage")}</p>
            ) : null}
            <p className="mt-2">{t("refreshNote")}</p>
          </details>
        </>
      ) : !query.isPending && !(input.analysisId && section === "trends") ? (
        <div className="mt-6 rounded-xl border border-dashed p-7">
          <MessageSquare className="size-7 text-primary" />
          <h2 className="mt-4 text-xl font-medium">
            {t(input.propertyId ? "noData" : "noAnalysisData")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t(input.propertyId ? "noDataHint" : "reuseHint")}
          </p>
          {onCollect && section !== "collection" ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={onCollect}
            >
              {app(
                input.analysisId ? "prepareComparison" : "collectionSection",
              )}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
