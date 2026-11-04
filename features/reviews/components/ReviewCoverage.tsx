"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { sourceStatusSchema } from "../schemas/collection";
import type { ReviewCoverage as Coverage } from "../schemas/reviewCoverage";
import { Button } from "@/components/ui/button";
export function ReviewCoverage({
  coverage,
  ready,
  frozen,
  pending,
  error,
  onRetry,
}: {
  coverage: Coverage[];
  ready: boolean;
  frozen: boolean;
  pending: boolean;
  error: boolean;
  onRetry?: () => void;
}) {
  const t = useTranslations("reviews");
  return (
    <section className="mt-5 exoid-panel p-5" aria-live="polite">
      <h3 className="font-semibold">{t("coverageTitle")}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {t(frozen ? "frozenCoverageHint" : "manualCoverageHint")}
      </p>
      {!ready ? (
        <p className="mt-3 text-sm font-medium">{t("comparisonBlocked")}</p>
      ) : null}
      <div className="mt-4 space-y-4">
        {coverage.map((state) => (
          <div key={state.listingId} className="border-t pt-3 text-sm">
            <p className="font-medium">
              {state.label} ·{" "}
              {t(
                state.reason === "covered"
                  ? "coverageReady"
                  : state.reason === "collecting"
                    ? "running"
                    : state.reason === "future"
                      ? "futureCoverage"
                      : state.reason === "placeRemoved"
                        ? "placeRemoved"
                        : state.reason === "incomplete"
                          ? "partial"
                          : "notCollected",
              )}
            </p>
            <p className="mt-2 text-muted-foreground">
              {t("coveredDates")}:{" "}
              {state.covered.length
                ? state.covered
                    .map((range) => `${range.start} — ${range.end}`)
                    .join("; ")
                : "—"}{" "}
              (UTC)
            </p>
            {state.missing.length ? (
              <p className="mt-1 text-muted-foreground">
                {t("missingDates")}:{" "}
                {state.missing
                  .map((range) => `${range.start} — ${range.end}`)
                  .join("; ")}{" "}
                (UTC)
              </p>
            ) : null}
            {!state.ready && state.propertyId ? (
              <Link
                href={`/properties/${state.propertyId}`}
                className="mt-2 inline-block text-primary underline underline-offset-4"
              >
                {t("openPlace")}
              </Link>
            ) : null}
            {state.collections.length ? (
              <details className="mt-2 text-muted-foreground">
                <summary className="cursor-pointer">{t("diagnostics")}</summary>
                {state.collections.map((run) => (
                  <div key={run.id} className="mt-3 space-y-1 border-t pt-2">
                    <p>
                      {t("requestedDates")}: {run.start} — {run.end} (UTC)
                    </p>
                    <p>
                      {t("providerScope", { start: run.providerStart })}
                      {run.providerEnd
                        ? ` ${t("providerThrough", { end: run.providerEnd })}`
                        : null}
                    </p>
                    <p>
                      {t("observedRange")}: {run.earliest?.slice(0, 10) ?? "—"}{" "}
                      — {run.latest?.slice(0, 10) ?? "—"}
                    </p>
                    <p>
                      {t("collected")}: {run.collectedAt ?? "—"}
                    </p>
                    <p>
                      {t("collection")}:{" "}
                      {sourceStatusSchema.safeParse(run.status).success
                        ? t(sourceStatusSchema.parse(run.status))
                        : t("unavailable")}
                    </p>
                    {run.capped ? <p>{t("cap")}</p> : null}
                    {run.skipped ? (
                      <p>
                        {t("skipped")}: {run.skipped}
                      </p>
                    ) : null}
                    {run.error ? (
                      <p>
                        {t("error")}:{" "}
                        {t.has(`providerErrors.${run.error}`)
                          ? t(`providerErrors.${run.error}`)
                          : run.error}
                      </p>
                    ) : null}
                  </div>
                ))}
              </details>
            ) : null}
          </div>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {t("collectionError")}
        </p>
      ) : null}
      {!frozen && !ready && onRetry ? (
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          disabled={pending || coverage.some((state) => state.activeRun)}
          onClick={onRetry}
        >
          {t("retryMissing")}
        </Button>
      ) : null}
    </section>
  );
}
