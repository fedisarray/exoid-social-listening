"use client";
import { useLocale, useTranslations } from "next-intl";
import type { AnalysisConfig } from "../schemas/analysisConfig";
import {
  lastCompleteDate,
  resolvePeriod,
} from "@/features/_shared/domain/period";
import {
  relativePeriodPresets,
  resolvePeriodPreset,
  type PeriodPreset,
} from "@/features/_shared/domain/periodPresets";
import { Choice } from "@/features/_shared/components/Choice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
export function PeriodFields({
  value,
  onChange,
  compact = false,
}: {
  compact?: boolean;
  value: AnalysisConfig["period"];
  onChange: (value: AnalysisConfig["period"]) => void;
}) {
  const t = useTranslations("app");
  const locale = useLocale();
  const now = new Date();
  const latestDate = now.toISOString().slice(0, 10);
  const preset =
    value.kind === "quarter"
      ? `q${value.quarter}`
      : value.kind === "l12m"
        ? "l12m"
        : (relativePeriodPresets.find((preset) => {
            const range = resolvePeriodPreset(preset, value, now);
            return range.start === value.start && range.end === value.end;
          }) ?? "custom");
  const date = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeZone: "UTC",
        }).format(new Date(`${value}T00:00:00Z`))
      : value;
  function update(patch: Partial<typeof value>) {
    if (
      [patch.start, patch.end, patch.cutoff].some(
        (date) => date && date > latestDate,
      )
    )
      return;
    const next = { ...value, ...patch };
    if (
      next.cutoff.length === 10 &&
      next.start.length === 10 &&
      next.end.length === 10 &&
      next.year >= 2000 &&
      next.year <= 2100
    ) {
      onChange(resolvePeriod(next));
    } else onChange(next);
  }
  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
      <Choice
        label={t("period")}
        value={preset}
        onChange={(preset) =>
          onChange(resolvePeriodPreset(preset as PeriodPreset, value, now))
        }
        options={[
          ...([1, 2, 3, 4] as const).map((quarter) => ({
            value: `q${quarter}`,
            label: `Q${quarter} · ${new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(value.year, (quarter - 1) * 3, 1)))} – ${new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(value.year, quarter * 3 - 1, 1)))}`,
          })),
          ...relativePeriodPresets.map((preset) => ({
            value: preset,
            label: t(`periodPresets.${preset}`),
          })),
          { value: "l12m", label: t("l12m") },
          { value: "custom", label: t("custom") },
        ]}
      />
      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        {value.kind === "quarter" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="period-year">{t("year")}</Label>
              <Input
                id="period-year"
                type="number"
                min="2000"
                max="2100"
                value={value.year}
                onChange={(e) => update({ year: Number(e.target.value) })}
              />
            </div>
          </>
        ) : value.kind === "l12m" ? (
          <div className="space-y-2">
            <Label htmlFor="cutoff">{t("cutoff")}</Label>
            <Input
              id="cutoff"
              type="date"
              max={latestDate}
              value={value.cutoff}
              onChange={(e) => update({ cutoff: e.target.value })}
            />
          </div>
        ) : null}
        {value.kind === "custom" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="start">{t("start")}</Label>
              <Input
                id="start"
                type="date"
                max={latestDate}
                value={value.start}
                onChange={(e) =>
                  update({ kind: "custom", start: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">{t("end")}</Label>
              <Input
                id="end"
                type="date"
                max={latestDate}
                value={value.end}
                onChange={(e) =>
                  update({
                    kind: "custom",
                    end: e.target.value,
                    cutoff: e.target.value,
                  })
                }
              />
            </div>
          </>
        ) : null}
      </div>
      <div
        className={compact ? "text-sm" : "rounded-lg bg-secondary px-4 py-3"}
      >
        {!compact ? (
          <p className="text-xs text-muted-foreground">{t("dateScope")}</p>
        ) : null}
        <p className={cn("font-medium tabular-nums", !compact && "mt-1")}>
          {date(value.start)} — {date(value.end)}
        </p>
      </div>
      {value.end > lastCompleteDate(now) ? (
        <p
          role="status"
          className="text-sm leading-relaxed text-muted-foreground"
        >
          {t("periodIncompleteHint")}
        </p>
      ) : null}
      {!compact ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("periodHint")}
        </p>
      ) : null}
    </div>
  );
}
