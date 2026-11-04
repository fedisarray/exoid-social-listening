"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
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
  const form = useForm<DateInterval>({
    resolver: zodResolver(comparisonSyncDatesSchema),
    defaultValues: { start: period.start, end: period.end },
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
      className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        onCloseAutoFocus();
      }}
    >
      <DialogHeader>
        <DialogTitle>{t("syncData")}</DialogTitle>
        <DialogDescription>{t("syncTooltip")}</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="comparison-sync-start">{app("start")}</Label>
            <Input
              id="comparison-sync-start"
              type="date"
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
        <p className="text-sm text-muted-foreground">{t("syncHistoryHint")}</p>
        <p className="text-xs text-muted-foreground">
          {t("syncAllPlaces", { count: data.coverage.length })}
        </p>
        <ReviewCoverage
          coverage={coverage}
          ready={ready}
          frozen={false}
          pending={pending}
          error={false}
        />
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
        <DialogFooter>
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
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
