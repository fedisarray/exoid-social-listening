"use client";

import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Choice } from "@/features/_shared/components/Choice";
import type { ExportReviewExcelInput } from "../schemas/exportReviewExcelInput";
import { reviewExcelSheets } from "../schemas/reviewExcelOptions";
import { reviewExcelSheetPresets } from "../domain/reviewExcelSheetPresets";

export function WorksheetEditor({
  form,
}: {
  form: UseFormReturn<ExportReviewExcelInput>;
}) {
  const t = useTranslations("reviews");
  const period = useWatch({ control: form.control, name: "period" });
  const options = useWatch({ control: form.control, name: "options" });
  const presets = reviewExcelSheetPresets(period);
  const metricLabels = {
    reviews: t("sheetMetricReviews"),
    rating: t("sheetMetricRating"),
    satisfaction: t("sheetMetricSatisfaction"),
  };
  const windowLabels = {
    selected: t("sheetWindowSelected"),
    l12m: t("trendRollingLabel"),
    annual: t("sheetWindowAnnual"),
    quarterly: t("sheetWindowQuarterly"),
    monthly: t("sheetWindowMonthly"),
  };
  const groupLabels = {
    properties: t("sheetGroupProperties"),
    anchors: t("sheetGroupAnchors"),
    all: t("sheetGroupAll"),
    own: t("sheetGroupOwn"),
    competitors: t("sheetGroupCompetitors"),
  };
  const changeSheets = (sheets: typeof options.sheets) =>
    form.setValue("options.sheets", sheets, {
      shouldDirty: true,
      shouldValidate: true,
    });
  function move(index: number, offset: number) {
    const sheets = [...options.sheets];
    [sheets[index], sheets[index + offset]] = [
      sheets[index + offset],
      sheets[index],
    ];
    changeSheets(sheets);
  }
  return (
    <section className="exoid-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{t("exportContent")}</h2>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() =>
            form.setValue(
              "options",
              {
                ...options,
                sheets: [...reviewExcelSheets],
                sheetSettings: presets,
              },
              { shouldDirty: true, shouldValidate: true },
            )
          }
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {t("sheetRestore")}
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("exportContentHint")}
      </p>
      <div className="mt-4 divide-y">
        {options.sheets.map((id, index) => {
          const config = options.sheetSettings?.[id] ?? presets[id];
          const prefix = `options.sheetSettings.${id}` as const;
          const nameError =
            form.formState.errors.options?.sheetSettings?.[id]?.name;
          return (
            <details
              key={id}
              className="py-3"
              open={nameError ? true : undefined}
            >
              <summary className="min-h-11 cursor-pointer rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-ring">
                <span className="break-words font-medium">
                  {config.name || t("sheetUntitled")}
                </span>
                <span className="mt-1 block pl-4 text-xs text-muted-foreground">
                  {metricLabels[config.metric]} · {windowLabels[config.window]}{" "}
                  {config.window === "quarterly"
                    ? ` · Q${config.quarter ?? period.quarter} ${config.year ?? period.year}`
                    : ""}{" "}
                  · {groupLabels[config.group]}
                </span>
              </summary>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`sheet-${id}-name`}>{t("sheetName")}</Label>
                  <Input
                    id={`sheet-${id}-name`}
                    maxLength={31}
                    aria-invalid={Boolean(nameError)}
                    aria-describedby={
                      nameError ? `sheet-${id}-error` : undefined
                    }
                    {...form.register(`${prefix}.name`)}
                  />
                  {nameError ? (
                    <p
                      id={`sheet-${id}-error`}
                      role="alert"
                      className="text-sm text-destructive"
                    >
                      {t("sheetNameError")}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["metric", "sheetMetric", metricLabels],
                      ["window", "sheetWindow", windowLabels],
                      ["group", "sheetGroup", groupLabels],
                    ] as const
                  ).map(([key, label, labels]) => (
                    <Controller
                      key={key}
                      control={form.control}
                      name={`${prefix}.${key}`}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label htmlFor={`sheet-${id}-${key}`}>
                            {t(label)}
                          </Label>
                          <Choice
                            id={`sheet-${id}-${key}`}
                            label={t(label)}
                            value={field.value ?? config[key]}
                            onChange={(value) => {
                              field.onChange(value);
                              if (key === "window" && value === "quarterly") {
                                form.setValue(
                                  `${prefix}.quarter`,
                                  config.quarter ?? period.quarter,
                                  { shouldDirty: true, shouldValidate: true },
                                );
                                form.setValue(
                                  `${prefix}.year`,
                                  config.year ?? period.year,
                                  { shouldDirty: true, shouldValidate: true },
                                );
                              }
                            }}
                            options={Object.entries(labels).map(
                              ([value, label]) => ({ value, label }),
                            )}
                          />
                        </div>
                      )}
                    />
                  ))}
                  {config.window === "quarterly" ? (
                    <>
                      <Controller
                        control={form.control}
                        name={`${prefix}.quarter`}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor={`sheet-${id}-quarter`}>
                              {t("sheetQuarter")}
                            </Label>
                            <Choice
                              id={`sheet-${id}-quarter`}
                              label={t("sheetQuarter")}
                              value={String(field.value ?? period.quarter)}
                              onChange={(value) =>
                                field.onChange(Number(value))
                              }
                              options={[1, 2, 3, 4].map((quarter) => ({
                                value: String(quarter),
                                label: `Q${quarter}`,
                              }))}
                            />
                          </div>
                        )}
                      />
                      <Controller
                        control={form.control}
                        name={`${prefix}.year`}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor={`sheet-${id}-year`}>
                              {t("sheetYear")}
                            </Label>
                            <Input
                              id={`sheet-${id}-year`}
                              type="number"
                              min={2000}
                              max={2100}
                              value={field.value ?? period.year}
                              onChange={(event) =>
                                field.onChange(event.target.valueAsNumber)
                              }
                              aria-invalid={Boolean(
                                form.formState.errors.options?.sheetSettings?.[
                                  id
                                ]?.year,
                              )}
                            />
                          </div>
                        )}
                      />
                    </>
                  ) : null}
                  {config.window === "annual" ||
                  config.window === "quarterly" ? (
                    <div className="space-y-2">
                      <Label htmlFor={`sheet-${id}-years`}>
                        {t("exportHistory")}
                      </Label>
                      <Input
                        id={`sheet-${id}-years`}
                        type="number"
                        min={0}
                        max={20}
                        aria-invalid={Boolean(
                          form.formState.errors.options?.sheetSettings?.[id]
                            ?.historyYears,
                        )}
                        {...form.register(`${prefix}.historyYears`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  ) : null}
                </div>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    {...form.register(`${prefix}.includeCharts`)}
                  />
                  {t("exportCharts")}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={t("sheetMoveUp", { name: config.name })}
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                    {t("sheetUp")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === options.sheets.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={t("sheetMoveDown", { name: config.name })}
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                    {t("sheetDown")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={options.sheets.length === 1}
                    onClick={() => {
                      const sheetSettings = { ...options.sheetSettings };
                      delete sheetSettings[id];
                      form.setValue(
                        "options",
                        {
                          ...options,
                          sheets: options.sheets.filter(
                            (sheet) => sheet !== id,
                          ),
                          sheetSettings,
                        },
                        { shouldDirty: true, shouldValidate: true },
                      );
                    }}
                    aria-label={t("sheetRemove", { name: config.name })}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    {t("sheetDelete")}
                  </Button>
                </div>
              </div>
            </details>
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        disabled={options.sheets.length === reviewExcelSheets.length}
        onClick={() => {
          const id = reviewExcelSheets.find(
            (id) => !options.sheets.includes(id),
          );
          if (!id) return;
          const names = new Set(
            Object.values(options.sheetSettings ?? {}).map((config) =>
              config?.name.toLowerCase(),
            ),
          );
          let number = options.sheets.length + 1;
          while (names.has(t("sheetNewName", { number }).toLowerCase()))
            number++;
          const config = {
            ...presets[id],
            name: t("sheetNewName", { number }),
            metric: "rating" as const,
            window: "selected" as const,
            group: "all" as const,
          };
          form.setValue(
            "options",
            {
              ...options,
              sheets: [...options.sheets, id],
              sheetSettings: { ...options.sheetSettings, [id]: config },
            },
            { shouldDirty: true, shouldValidate: true },
          );
        }}
      >
        <Plus className="size-4" aria-hidden="true" />
        {t("sheetAdd")}
      </Button>
    </section>
  );
}
