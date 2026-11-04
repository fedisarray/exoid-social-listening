"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Download, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Period } from "@/features/_shared/schemas/period";
import { exportReviewExcel } from "../actions/exportReviewExcel";
import type { ExportReviewExcelInput } from "../schemas/exportReviewExcelInput";
import type { ReviewDashboard } from "../schemas/getReviewDashboardOutput";

export function ExportReviewExcel({
  analysisId,
  version,
  period,
  savedPeriod,
  data,
  onSnapshot,
}: {
  analysisId: string;
  version: number;
  period: Period;
  savedPeriod: Period;
  data: ReviewDashboard | undefined;
  onSnapshot: (id: string) => void;
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const download = useMutation({
    mutationFn: async (input: ExportReviewExcelInput) => {
      const result = await exportReviewExcel(input);
      if (!result.ok) throw new Error(result.code);
      const bytes = Uint8Array.from(atob(result.content), (char) =>
        char.charCodeAt(0),
      );
      const url = URL.createObjectURL(
        new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return result.snapshotId;
    },
    onSuccess: (snapshotId) => {
      onSnapshot(snapshotId);
      void client.invalidateQueries({
        queryKey: ["review-dashboard", analysisId],
      });
    },
  });
  const quarter = period.kind === "quarter";
  const errors: Record<string, string> = {
    COVERAGE_INCOMPLETE: "excelCoverageError",
    CONFIGURATION_CHANGED: "excelVersionError",
    ANALYSIS_NOT_FOUND: "excelNotFound",
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value && !download.isPending) download.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={!data || download.isPending}
        >
          <Download className="size-4" aria-hidden="true" />
          {t("exportExcel")}
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle>{t("exportExcel")}</DialogTitle>
          <DialogDescription>{t("excelDescription")}</DialogDescription>
        </DialogHeader>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium">{t("selected")}</dt>
            <dd className="mt-1 tabular-nums">
              {period.start} — {period.end} (UTC)
            </dd>
          </div>
          <div>
            <dt className="font-medium">{t("snapshotDates")}</dt>
            <dd className="mt-1 tabular-nums">
              {data?.snapshot?.start ?? savedPeriod.start} —{" "}
              {data?.snapshot?.end ?? savedPeriod.end} (UTC)
            </dd>
          </div>
          {data?.snapshot ? (
            <div>
              <dt className="font-medium">{t("excelDataset")}</dt>
              <dd className="mt-1 break-all text-muted-foreground">
                {data.snapshot.id} · v{data.snapshot.version}
              </dd>
            </div>
          ) : null}
        </dl>
        <p className="text-sm text-muted-foreground">
          {t(data?.snapshot ? "excelExistingDataset" : "excelNewDataset")}
        </p>
        <p className="text-sm text-muted-foreground">{t("excelMissing")}</p>
        {!quarter ? (
          <p role="status" className="text-sm">
            {t("excelQuarterRequired")}
          </p>
        ) : null}
        {quarter && !data?.comparisonReady ? (
          <p role="status" className="text-sm">
            {t("comparisonBlocked")}
          </p>
        ) : null}
        {download.isError ? (
          <p role="alert" className="text-sm text-destructive">
            {t(errors[download.error.message] ?? "excelError")}
          </p>
        ) : null}
        {download.isSuccess ? (
          <p role="status" className="text-sm">
            {t("excelDownloaded")}
          </p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            {t("close")}
          </Button>
          <Button
            type="button"
            disabled={!quarter || !data?.comparisonReady || download.isPending}
            onClick={() =>
              download.mutate({
                analysisId,
                expectedVersion: version,
                period,
                locale: locale === "en" ? "en" : "it",
                ...(data?.snapshot ? { snapshotId: data.snapshot.id } : {}),
              })
            }
          >
            {download.isPending ? (
              <LoaderCircle
                className="size-4 motion-safe:animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            {t(download.isPending ? "excelGenerating" : "excelDownload")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
