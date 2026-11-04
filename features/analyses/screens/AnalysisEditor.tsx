"use client";
import { ListingThumbnail } from "@/features/_shared/components/ListingThumbnail";
import { ListingDetails } from "@/features/_shared/components/ListingDetails";
import Link from "next/link";
import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Check,
  Save,
  ExternalLink,
} from "lucide-react";
import {
  saveAnalysisInputSchema,
  type SaveAnalysisInput,
} from "../schemas/saveAnalysisInput";
import type { AnalysisDetail } from "../schemas/analysisDetail";
import type { Selection } from "../schemas/analysisConfig";
import { defaultPeriod } from "@/features/_shared/domain/period";
import { getAnalysis } from "../actions/getAnalysis";
import { useSaveAnalysis } from "../hooks/useSaveAnalysis";
import { analysisKeys } from "../constants/queryKeys";
import { PeriodFields } from "../components/PeriodFields";
import { SavedPropertyPicker } from "@/features/properties/components/SavedPropertyPicker";
import { Choice } from "@/features/_shared/components/Choice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
export function AnalysisEditor({
  initial,
}: {
  initial: AnalysisDetail | null;
}) {
  const t = useTranslations("app");
  const router = useRouter();
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
      name: initial?.name ?? "",
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
  const conflict = mutation.error?.message === "CONFLICT";
  return (
    <>
      <Link
        href="/analyses"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("back")}
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">
            {initial ? t("editTitle") : t("newTitle")}
          </h1>
          <p className="mt-3 text-muted-foreground">{t("setupDescription")}</p>
        </div>
        {initial ? (
          <Link
            className="text-sm text-primary underline underline-offset-4"
            href={`/analyses/${initial.id}/dashboard`}
          >
            {t("dashboard")}
          </Link>
        ) : null}
      </div>
      <form
        onSubmit={form.handleSubmit(submit, () => setValidation(true))}
        className="mt-7 max-w-3xl"
      >
        <fieldset disabled={mutation.isPending} className="grid min-w-0 gap-6">
          <section className="min-w-0 space-y-7 exoid-panel p-4 sm:p-5 md:p-6">
            <h2 className="text-lg font-semibold">{t("setupName")}</h2>
            <div className="space-y-2">
              <Label htmlFor="analysis-name">{t("name")}</Label>
              <Input
                id="analysis-name"
                placeholder={t("namePlaceholder")}
                maxLength={120}
                {...form.register("name")}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{t("setupPlaces")}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("setupRolesHint")}
              </p>
              <SavedPropertyPicker
                selected={values.config.listings.map((x) => x.sourceId)}
                onConfirm={(listing) =>
                  rows.append({
                    ...listing,
                    role: rows.fields.length ? "competitor" : "primary",
                    label: listing.name,
                  })
                }
              />
            </div>
            {rows.fields.length ? (
              <div className="space-y-4">
                {rows.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border-t py-5 first:border-t-0"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <ListingThumbnail listing={field} />
                      <div className="min-w-0 flex-1 basis-36">
                        <h3 className="font-medium break-words">
                          {field.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground break-words">
                          {field.address} {field.country}
                        </p>
                        <ListingDetails listing={field} />
                        <a
                          className="mt-2 inline-flex items-center gap-1 text-xs text-primary"
                          href={field.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t("source")}
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t("moveUp")}
                          disabled={index === 0}
                          onClick={() => rows.move(index, index - 1)}
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t("moveDown")}
                          disabled={index === rows.fields.length - 1}
                          onClick={() => rows.move(index, index + 1)}
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t("remove")}
                          onClick={() => rows.remove(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`role-${field.sourceId}`}>
                          {t("role")}
                        </Label>
                        <Choice
                          id={`role-${field.sourceId}`}
                          label={t("role")}
                          value={
                            values.config.listings[index]?.role ?? "competitor"
                          }
                          onChange={(role) =>
                            form.setValue(
                              `config.listings.${index}.role`,
                              role as Selection["role"],
                              { shouldDirty: true },
                            )
                          }
                          options={(
                            [
                              "primary",
                              "additionalOwn",
                              "competitor",
                              "anchor",
                            ] as const
                          ).map((role) => ({ value: role, label: t(role) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`label-${field.sourceId}`}>
                          {t("label")}
                        </Label>
                        <Input
                          id={`label-${field.sourceId}`}
                          {...form.register(`config.listings.${index}.label`)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
                {t("noProperties")}
              </div>
            )}
          </section>
          <aside className="self-start exoid-panel p-4 sm:p-5">
            <h2 className="mb-5 text-lg font-semibold">{t("setupDates")}</h2>
            <PeriodFields
              value={values.config.period}
              onChange={(period) =>
                form.setValue("config.period", period, { shouldDirty: true })
              }
            />
          </aside>
        </fieldset>
        <div className="sticky bottom-0 z-10 mt-6 exoid-panel p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
            <Button type="submit" disabled={mutation.isPending}>
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
      </form>
    </>
  );
}
