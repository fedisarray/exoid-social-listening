"use client";
import { useTranslations } from "next-intl";
import type { AnalysisConfig } from "../schemas/analysisConfig";
import { resolvePeriod } from "@/features/_shared/domain/period";
import { Choice } from "@/features/_shared/components/Choice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function PeriodFields({
  value,
  onChange,
}: {
  value: AnalysisConfig["period"];
  onChange: (value: AnalysisConfig["period"]) => void;
}) {
  const t = useTranslations("app");
  function update(patch: Partial<typeof value>) {
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
    <div className="space-y-5">
      <Choice
        label={t("period")}
        value={value.kind}
        onChange={(kind) => update({ kind: kind as typeof value.kind })}
        options={(["quarter", "l12m", "custom"] as const).map((x) => ({
          value: x,
          label: t(x),
        }))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="space-y-2">
              <Label htmlFor="period-quarter">{t("quarterLabel")}</Label>
              <Choice
                id="period-quarter"
                label={t("quarterLabel")}
                value={String(value.quarter)}
                onChange={(quarter) => update({ quarter: Number(quarter) })}
                options={[1, 2, 3, 4].map((q) => ({
                  value: String(q),
                  label: `Q${q}`,
                }))}
              />
            </div>
          </>
        ) : value.kind === "l12m" ? (
          <div className="space-y-2">
            <Label htmlFor="cutoff">{t("cutoff")}</Label>
            <Input
              id="cutoff"
              type="date"
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
                value={value.start}
                onChange={(e) => update({ start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">{t("end")}</Label>
              <Input
                id="end"
                type="date"
                value={value.end}
                onChange={(e) =>
                  update({ end: e.target.value, cutoff: e.target.value })
                }
              />
            </div>
          </>
        ) : null}
      </div>
      <div className="rounded-lg bg-secondary px-4 py-3">
        <p className="text-xs text-muted-foreground">{t("dateScope")}</p>
        <p className="mt-1 font-medium tabular-nums">
          {value.start} — {value.end}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t("periodHint")}
      </p>
    </div>
  );
}
