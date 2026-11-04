"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Period } from "@/features/_shared/schemas/period";
import type { useReviewDashboard } from "../hooks/useReviewDashboard";
import { ComparisonSyncDialog } from "./ComparisonSyncDialog";

export function ComparisonSyncControl({
  analysisId,
  period,
  dashboard,
  onLive,
}: {
  analysisId: string;
  period: Period;
  dashboard: ReturnType<typeof useReviewDashboard>;
  onLive: () => void;
}) {
  const t = useTranslations("reviews");
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const { query, ensure } = dashboard;
  const data = query.data;
  const frozen = data?.mode === "frozen";
  const active = Boolean(
    data?.coverage.some((s) => s.activeRun) ||
    (data?.run && ["queued", "running"].includes(data.run.status)),
  );
  const busy = active || ensure.isPending;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={trigger}
            type="button"
            disabled={!data}
            onClick={() => (frozen ? onLive() : setOpen(true))}
          >
            <RefreshCw
              className={busy ? "size-4 motion-safe:animate-spin" : "size-4"}
              aria-hidden="true"
            />
            {t(frozen ? "syncReturnLive" : busy ? "syncing" : "syncData")}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {t(frozen ? "syncFrozen" : "syncTooltip")}
        </TooltipContent>
      </Tooltip>
      <span className="sr-only" role="status">
        {busy ? t("syncing") : ""}
      </span>
      <Dialog open={open && !frozen} onOpenChange={setOpen}>
        {open && data && !frozen ? (
          <ComparisonSyncDialog
            analysisId={analysisId}
            period={period}
            data={data}
            ensure={ensure}
            active={active}
            onCloseAutoFocus={() => trigger.current?.focus()}
          />
        ) : null}
      </Dialog>
    </TooltipProvider>
  );
}
