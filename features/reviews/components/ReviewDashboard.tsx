"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, RefreshCw, MessageSquare, ExternalLink } from "lucide-react";
import { useReviewDashboard } from "../hooks/useReviewDashboard";
import type { GetReviewDashboardInput } from "../schemas/getReviewDashboardInput";
import type {
  ReviewDashboard as DashboardData,
  MetricFacts,
} from "../schemas/getReviewDashboardOutput";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Choice } from "@/features/_shared/components/Choice";
import { Label } from "@/components/ui/label";
export function ReviewDashboard({
  input,
  initial,
  version,
  propertyCount,
  role,
  onSnapshot,
}: {
  input: GetReviewDashboardInput;
  initial: { input: GetReviewDashboardInput; data: DashboardData };
  version: number;
  propertyCount: number;
  role: string;
  onSnapshot: (id: string) => void;
}) {
  const t = useTranslations("reviews");
  const app = useTranslations("app");
  const locale = useLocale();
  const { query, collect } = useReviewDashboard(input, initial);
  const [limit, setLimit] = useState("10000");
  const data = query.data;
  const active = Boolean(
    data?.run && ["queued", "running"].includes(data.run.status),
  );
  const properties =
    data?.metrics?.properties.filter(
      (p) => role === "all" || p.role === role,
    ) ?? [];
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
  function table(
    title: string,
    rows: (MetricFacts & { listingId: string; bucket?: string })[],
    subtitle?: string,
  ) {
    const selected = rows.filter((r) => ids.has(r.listingId));
    return (
      <section className="mt-8">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
        {selected.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[570px] text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  {[
                    t("property"),
                    t("bucket"),
                    t("reviews"),
                    t("rating"),
                    t("satisfied"),
                  ].map((h) => (
                    <th key={h} className="px-2 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {selected.map((r, i) => (
                  <tr key={`${r.listingId}-${r.bucket ?? i}`}>
                    <td className="px-2 py-3">{labels.get(r.listingId)}</td>
                    <td className="px-2 py-3">{r.bucket ?? "—"}</td>
                    <td className="px-2 py-3 tabular-nums">
                      {number(r.reviews)}
                    </td>
                    <td className="px-2 py-3 tabular-nums">
                      {number(r.rating, 2)}
                    </td>
                    <td className="px-2 py-3 tabular-nums">
                      {number(r.satisfaction, 1)}
                      {r.satisfaction !== null ? "%" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {t("noWindowData")}
          </p>
        )}
      </section>
    );
  }
  return (
    <div className="mt-7 min-w-0 border-t pt-6">
      <div className="flex flex-wrap items-end gap-3">
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
        <Button
          type="button"
          disabled={active || collect.isPending}
          onClick={() => collect.mutate(Number(limit))}
        >
          {active ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {t(
            collect.isPending
              ? "startingCollection"
              : data?.snapshot
                ? "refresh"
                : "collect",
          )}
        </Button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {t("collectHint")} {t("propertyCount")}: {propertyCount}.
      </p>
      {collect.isError ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {t(
            collect.error.message === "APIFY_NOT_CONFIGURED"
              ? "apifyMissing"
              : collect.error.message === "WORKER_NOT_CONFIGURED"
                ? "workerMissing"
                : "collectionError",
          )}
        </p>
      ) : null}
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
                      {t("error")}: {s.error}
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
      {query.isPending ? <Skeleton className="mt-6 h-48 w-full" /> : null}
      {data?.snapshot && data.metrics ? (
        <>
          <div className="mt-6 text-sm text-muted-foreground">
            <p>
              {t("collected")}: {date(data.snapshot.createdAt)} · {t("version")}{" "}
              {data.snapshot.version}
            </p>
            <p className="mt-1">
              {t("snapshotDates")}: {data.snapshot.start} — {data.snapshot.end}{" "}
              (UTC)
            </p>
            <p className="mt-3 leading-relaxed">{t("coverage")}</p>
            {data.snapshot.version !== version ? (
              <p className="mt-3 text-destructive">{t("changedConfig")}</p>
            ) : null}
            {input.period.start < data.snapshot.start ||
            input.period.end > data.snapshot.end ? (
              <p className="mt-3 text-destructive">{t("outOfRange")}</p>
            ) : null}
          </div>
          <h2 className="mt-7 text-lg font-semibold">
            {t("selected")} · {input.period.start} — {input.period.end}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  {[
                    t("property"),
                    t("reviews"),
                    t("rated"),
                    t("rating"),
                    t("satisfied"),
                    t("text"),
                  ].map((h) => (
                    <th className="px-2 py-3 font-medium" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {properties.map((p) => (
                  <tr key={p.listingId}>
                    <td className="px-2 py-4">
                      <span className="font-medium">{p.label}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {app(p.role as "primary")}
                      </span>
                    </td>
                    {[
                      p.reviews,
                      p.ratedCount,
                      p.rating,
                      p.satisfaction,
                      p.textReviews,
                    ].map((v, i) => (
                      <td key={i} className="px-2 py-4 tabular-nums">
                        {p.available
                          ? `${number(v, i === 2 ? 2 : i === 3 ? 1 : 0)}${i === 3 && v !== null ? "%" : ""}`
                          : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {table(t("monthly"), data.metrics.monthly)}
          {table(
            t("rolling"),
            data.metrics.rolling,
            `${data.metrics.rollingStart} — ${data.metrics.rollingEnd}`,
          )}
          {table(t("annual"), data.metrics.annual)}
          {input.period.kind === "quarter"
            ? table(
                `${t("quarters")} · Q${input.period.quarter}`,
                data.metrics.quarters,
              )
            : null}
          {data.metrics.shared.length ? (
            <section className="mt-8">
              <h3 className="text-lg font-semibold">{t("shared")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("sharedNote")}
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead className="border-b text-left text-muted-foreground">
                    <tr>
                      {[
                        t("property"),
                        t("identities"),
                        t("shared"),
                        t("primaryShare"),
                        t("competitorShare"),
                        t("primaryRating"),
                        t("competitorRating"),
                      ].map((h) => (
                        <th key={h} className="p-2 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.metrics.shared
                      .filter((s) => role === "all" || ids.has(s.listingId))
                      .map((s) => (
                        <tr key={s.listingId}>
                          <td className="p-2">{labels.get(s.listingId)}</td>
                          <td className="p-2">
                            {number(s.primaryReviewers)} /{" "}
                            {number(s.competitorReviewers)}
                          </td>
                          <td className="p-2">{number(s.shared)}</td>
                          <td className="p-2">
                            {number(s.primaryShare, 1)}
                            {s.primaryShare !== null ? "%" : ""}
                          </td>
                          <td className="p-2">
                            {number(s.competitorShare, 1)}
                            {s.competitorShare !== null ? "%" : ""}
                          </td>
                          <td className="p-2">{number(s.primaryRating, 2)}</td>
                          <td className="p-2">
                            {number(s.competitorRating, 2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                {properties.map((p) => (
                  <p key={p.listingId}>
                    {p.label} · {t("identityCoverage")}:{" "}
                    {number(p.identifiedReviews)} / {number(p.reviews)}
                  </p>
                ))}
              </div>
            </section>
          ) : null}
          <section className="mt-8">
            <h3 className="text-lg font-semibold">{t("evidence")}</h3>
            <div className="mt-3 divide-y">
              {data.metrics.samples
                .filter((r) => ids.has(r.listingId))
                .map((r, i) => (
                  <article key={i} className="py-4">
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="font-medium">
                        {labels.get(r.listingId)}
                      </span>
                      <span className="text-muted-foreground">
                        {r.publishedAt.slice(0, 10)} · {number(r.rating)} / 5{" "}
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
          <p className="mt-6 text-sm text-muted-foreground">
            {t("refreshNote")}
          </p>
        </>
      ) : !query.isPending ? (
        <div className="mt-6 rounded-xl border border-dashed p-7">
          <MessageSquare className="size-7 text-primary" />
          <h2 className="mt-4 text-xl font-medium">{t("noData")}</h2>
          <p className="mt-3 text-muted-foreground">{t("noDataHint")}</p>
        </div>
      ) : null}
    </div>
  );
}
