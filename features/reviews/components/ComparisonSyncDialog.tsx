"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { comparisonSyncDatesSchema } from "../schemas/comparisonSyncDates";
import type { DateInterval } from "../schemas/reviewCoverage";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";
import type { Period } from "@/features/_shared/schemas/period";
import type { useReviewDashboard } from "../hooks/useReviewDashboard";
import { reviewCoverage, windowCovered } from "../domain/reviewCoverage";
import { ReviewCoverage } from "./ReviewCoverage";
import { lastCompleteDate } from "@/features/_shared/domain/period";

export function ComparisonSyncDialog({
  analysisId,
  period,
  data,
  ensure,
  active,
  onCloseAutoFocus,
}: {
  analysisId: string;
  period: Period;
  data: ReviewDashboard;
  ensure: ReturnType<typeof useReviewDashboard>["ensure"];
  active: boolean;
  onCloseAutoFocus: () => void;
}) {
  const t = useTranslations("reviews");
  const app = useTranslations("app");
  const latestDate = lastCompleteDate();
  const form = useForm<DateInterval>({
    resolver: zodResolver(comparisonSyncDatesSchema),
    defaultValues: {
      start: period.start > latestDate ? latestDate : period.start,
      end: period.end > latestDate ? latestDate : period.end,
    },
  });
  const dates = useWatch({ control: form.control });
  const parsed = comparisonSyncDatesSchema.safeParse(dates);
  const coverage = parsed.success
    ? reviewCoverage(
        data.coverage,
        parsed.data,
        new Date().toISOString().slice(0, 10),
      )
    : data.coverage;
  const ready = parsed.success && windowCovered(data.coverage, parsed.data);
  const pending = active || ensure.isPending;
  const submit = form.handleSubmit(async (range) => {
    if (pending || ready || data.mode === "frozen") return;
    try {
      await ensure.mutateAsync({
        analysisId,
        period: { ...period, ...range, cutoff: range.end, kind: "custom" },
        retry: true,
      });
    } catch {
      // Mutation state retains the failure and allows a retry with the same dates.
    }
  });
  return (
    <DialogContent
      className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        onCloseAutoFocus();
      }}
    >
      <DialogHeader className="shrink-0 border-b px-5 py-5 text-left sm:px-6">
        <DialogTitle className="flex items-center gap-2.5 pr-6">
          <RefreshCw className="size-5 text-primary" aria-hidden="true" />
          {t("syncData")}
        </DialogTitle>
        <DialogDescription className="max-w-lg leading-relaxed">
          {t("syncTooltip")}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="flex min-h-0 flex-col">
        <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="comparison-sync-start">{app("start")}</Label>
              <Input
                id="comparison-sync-start"
                type="date"
                max={latestDate}
                {...form.register("start")}
                aria-invalid={Boolean(form.formState.errors.start)}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comparison-sync-end">{app("end")}</Label>
              <Input
                id="comparison-sync-end"
                type="date"
                max={latestDate}
                {...form.register("end")}
                aria-invalid={Boolean(form.formState.errors.end)}
                disabled={pending}
              />
            </div>
          </div>
          {Object.keys(form.formState.errors).length ? (
            <p role="alert" className="text-sm text-destructive">
              {t("syncInvalidDates")}
            </p>
          ) : null}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("syncAllPlaces", { count: data.coverage.length })}
          </p>
          <ReviewCoverage
            coverage={coverage}
            ready={ready}
            frozen={false}
            pending={pending}
            error={false}
            className="mt-0 rounded-none border-0 bg-transparent p-0 shadow-none backdrop-blur-none"
          />
          <details className="border-t pt-4 text-sm">
            <summary className="cursor-pointer font-medium">
              {t("syncHelp")}
            </summary>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {t("syncHistoryHint")}
            </p>
          </details>
          {ensure.isError ? (
            <p role="alert" className="text-sm text-destructive">
              {t(
                ensure.error.message === "WORKER_UNAVAILABLE"
                  ? "stalled"
                  : ensure.error.message === "APIFY_NOT_CONFIGURED"
                    ? "apifyMissing"
                    : ensure.error.message === "WORKER_NOT_CONFIGURED"
                      ? "workerMissing"
                      : "collectionError",
              )}
            </p>
          ) : null}
          {data.workerStalled ? (
            <p role="alert" className="text-sm text-destructive">
              {t("stalled")}
            </p>
          ) : null}
        </div>
        <DialogFooter className="shrink-0 border-t bg-muted/40 px-5 py-4 sm:px-6">
          {ready && !pending ? (
            <DialogClose asChild>
              <Button type="button">
                <Check className="size-4" aria-hidden="true" />
                {t("syncDone")}
              </Button>
            </DialogClose>
          ) : (
            <>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("close")}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={pending || ready || data.mode === "frozen"}
              >
                {pending ? (
                  <RefreshCw
                    className="size-4 motion-safe:animate-spin"
                    aria-hidden="true"
                  />
                ) : null}
                {t(
                  pending
                    ? "syncing"
                    : ready
                      ? "syncCovered"
                      : ensure.isError
                        ? "retryMissing"
                        : "syncStart",
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
