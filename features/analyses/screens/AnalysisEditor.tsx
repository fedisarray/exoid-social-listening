"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Save,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import {
  saveAnalysisInputSchema,
  type SaveAnalysisInput,
} from "../schemas/saveAnalysisInput";
import type { AnalysisDetail } from "../schemas/analysisDetail";
import { defaultPeriod } from "@/features/_shared/domain/period";
import { getAnalysis } from "../actions/getAnalysis";
import { useSaveAnalysis } from "../hooks/useSaveAnalysis";
import { analysisKeys } from "../constants/queryKeys";
import { PeriodFields } from "../components/PeriodFields";
import { ComparisonPlacePicker } from "../components/ComparisonPlacePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
export function AnalysisEditor({
  initial,
}: {
  initial: AnalysisDetail | null;
}) {
  const t = useTranslations("app");
  const router = useRouter();
  const locale = useLocale();
  const mutation = useSaveAnalysis(initial?.id ?? null);
  const [validation, setValidation] = useState(false);
  const detail = useQuery({
    queryKey: analysisKeys.detail(initial?.id ?? "new"),
    queryFn: () => getAnalysis({ id: initial!.id }),
    initialData: initial,
    enabled: Boolean(initial),
  });
  const form = useForm<SaveAnalysisInput>({
    resolver: zodResolver(saveAnalysisInputSchema),
    defaultValues: {
      id: initial?.id ?? null,
      expectedVersion: initial?.version ?? 0,
      name: initial?.name ?? t("newAnalysis"),
      config: initial?.config ?? { period: defaultPeriod(), listings: [] },
    },
  });
  const rows = useFieldArray({
    control: form.control,
    name: "config.listings",
  });
  const values = useWatch({ control: form.control }) as SaveAnalysisInput;
  async function submit(input: SaveAnalysisInput) {
    setValidation(false);
    try {
      const saved = await mutation.mutateAsync(input);
      form.reset({
        id: saved.id,
        expectedVersion: saved.version,
        name: saved.name,
        config: saved.config,
      });
      if (!initial) router.replace(`/analyses/${saved.id}/dashboard`);
      router.refresh();
    } catch {
      /* Mutation exposes a localized error and preserves RHF draft. */
    }
  }
  async function retryLatest() {
    if (!initial) return;
    try {
      const latest = await getAnalysis({ id: initial.id });
      if (!latest) return;
      form.setValue("expectedVersion", latest.version);
      const valid = await form.trigger();
      if (valid) await submit(form.getValues());
    } catch {
      /* Retain draft and current conflict message. */
    }
  }
  const dateFormat = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const formatDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
      ? dateFormat.format(new Date(`${value}T00:00:00Z`))
      : value;
  const dateRange = `${formatDate(values.config.period.start)} – ${formatDate(values.config.period.end)}`;
  const conflict = mutation.error?.message === "CONFLICT";
  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="sr-only">{initial ? t("editTitle") : t("newTitle")}</h1>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/analyses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:items-end">
          {initial ? (
            <Link
              className="text-sm text-primary underline underline-offset-4"
              href={`/analyses/${initial.id}/dashboard`}
            >
              {t("dashboard")}
            </Link>
          ) : null}
        </div>
      </div>
      <form
        id="analysis-setup"
        onSubmit={form.handleSubmit(submit, () => setValidation(true))}
        className="mt-6"
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Label htmlFor="analysis-name" className="sr-only">
            {t("name")}
          </Label>
          <Input
            id="analysis-name"
            className="h-auto min-w-0 flex-1 basis-40 py-1 text-xs font-semibold md:text-xs"
            placeholder={t("namePlaceholder")}
            maxLength={120}
            disabled={mutation.isPending}
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register("name")}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                aria-label={`${t("period")}: ${dateRange}`}
                className="order-last min-w-0 max-w-full lg:order-none lg:shrink-0"
              >
                <CalendarDays aria-hidden="true" />
                <span className="truncate tabular-nums">{dateRange}</span>
                <ChevronDown aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              collisionPadding={16}
              className="max-h-[var(--radix-popover-content-available-height)] w-[min(30rem,calc(100vw-2rem))] overflow-y-auto p-5"
            >
              <fieldset disabled={mutation.isPending}>
                <legend className="mb-4 text-base font-semibold">
                  {t("period")}
                </legend>
                <PeriodFields
                  value={values.config.period}
                  onChange={(period) =>
                    form.setValue("config.period", period, {
                      shouldDirty: true,
                    })
                  }
                />
              </fieldset>
            </PopoverContent>
          </Popover>
          <Button
            type="submit"
            form="analysis-setup"
            className="shrink-0"
            disabled={mutation.isPending}
          >
            <Save className="size-4" />
            {t(
              mutation.isPending
                ? "saving"
                : mutation.isError
                  ? "retry"
                  : initial
                    ? "save"
                    : "saveContinue",
            )}
          </Button>
        </div>
        <div className="mb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div
              aria-live="polite"
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              {mutation.isPending ? (
                <Badge variant="secondary">{t("pending")}</Badge>
              ) : null}
              {mutation.isPending ? (
                t("saving")
              ) : form.formState.isDirty ? (
                t("unsaved")
              ) : initial ? (
                <>
                  <Check className="size-4" />
                  {t("saved")} · {t("version")}{" "}
                  {detail.data?.version ?? initial.version}
                </>
              ) : (
                t("newDraft")
              )}
            </div>
          </div>
          {validation ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {t("invalid")}
            </p>
          ) : null}
          {mutation.isError ? (
            <div role="alert" className="mt-4">
              <p className="text-sm text-destructive">
                {t(
                  conflict
                    ? "conflict"
                    : mutation.error.message === "UNCONFIRMED_LISTING"
                      ? "unconfirmed"
                      : "saveError",
                )}
              </p>
              {conflict ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={retryLatest}
                >
                  {t("retryLatest")}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
        <fieldset disabled={mutation.isPending} className="min-w-0">
          <section className="min-w-0 space-y-6 exoid-panel p-4 sm:p-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">{t("setupPlaces")}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t("setupRolesHint")}
                </p>
              </div>
              <ComparisonPlacePicker
                selected={values.config.listings}
                onRoleChange={(index, role) =>
                  form.setValue(`config.listings.${index}.role`, role, {
                    shouldDirty: true,
                  })
                }
                onLabelChange={(index, label) =>
                  form.setValue(`config.listings.${index}.label`, label, {
                    shouldDirty: true,
                  })
                }
                onMove={rows.move}
                onToggle={(listing, checked) => {
                  if (checked) {
                    rows.append({
                      ...listing,
                      role: rows.fields.length ? "competitor" : "primary",
                      label: listing.name,
                    });
                  } else {
                    const index = rows.fields.findIndex(
                      (field) => field.sourceId === listing.sourceId,
                    );
                    if (index !== -1) rows.remove(index);
                  }
                }}
              />
            </div>
          </section>
        </fieldset>
      </form>
    </div>
  );
}
