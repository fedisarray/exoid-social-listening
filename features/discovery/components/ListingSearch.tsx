"use client";
import { ListingThumbnail } from "@/features/_shared/components/ListingThumbnail";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListingDetails } from "@/features/_shared/components/ListingDetails";
import { useForm, useWatch } from "react-hook-form";
import { LocationAutocomplete } from "./LocationAutocomplete";
import type { LocationSuggestion } from "../schemas/getLocationSuggestionsOutput";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Choice } from "@/features/_shared/components/Choice";
import { useLocale, useTranslations } from "next-intl";
import { Search, ExternalLink, LoaderCircle, Plus, X } from "lucide-react";
import { startDiscovery } from "../actions/startDiscovery";
import { getDiscovery } from "../actions/getDiscovery";
import { getLatestDiscovery } from "../actions/getLatestDiscovery";
import { getDiscoveryInputSchema } from "../schemas/getDiscoveryInput";
import { startDiscoveryInputSchema } from "../schemas/startDiscoveryInput";
import type { DiscoveryRun } from "../schemas/discoveryRun";
import type { Listing } from "@/features/_shared/schemas/listing";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export function ListingSearch({
  onConfirm,
  selected,
}: {
  onConfirm: (listing: Listing) => void | Promise<void>;
  selected: string[];
}) {
  const t = useTranslations("app");
  const locale = useLocale();
  const countryNames = new Intl.DisplayNames([locale], { type: "region" });
  const countries = [
    "AL",
    "AD",
    "AT",
    "BE",
    "BA",
    "BG",
    "HR",
    "CY",
    "CZ",
    "DK",
    "EE",
    "FI",
    "FR",
    "DE",
    "GR",
    "HU",
    "IS",
    "IE",
    "IT",
    "LV",
    "LI",
    "LT",
    "LU",
    "MT",
    "MD",
    "MC",
    "ME",
    "NL",
    "MK",
    "NO",
    "PL",
    "PT",
    "RO",
    "SM",
    "RS",
    "SK",
    "SI",
    "ES",
    "SE",
    "CH",
    "TR",
    "UA",
    "GB",
    "VA",
  ]
    .map((value) => ({ value, label: countryNames.of(value) ?? value }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
  const client = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const savedSearch = getDiscoveryInputSchema.safeParse({
    id: params.get("discovery"),
  });
  const rememberSearch = useCallback(
    (id: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (id) next.set("discovery", id);
      else next.delete("discovery");
      router.replace(`${pathname}?${next}`, { scroll: false });
    },
    [params, pathname, router],
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [open, setOpen] = useState(() => savedSearch.success);
  const [initial, setInitial] = useState<DiscoveryRun | null>(null);
  const [invalid, setInvalid] = useState(false);
  const form = useForm<{
    query: string;
    url: string;
    location: string;
    country: string;
    selectedLocation: LocationSuggestion | null;
  }>({
    defaultValues: {
      query: "",
      url: "",
      location: "",
      country: "IT",
      selectedLocation: null,
    },
  });
  const {
    location = "",
    country = "IT",
    selectedLocation,
  } = useWatch({ control: form.control });
  const search = useMutation({
    mutationFn: startDiscovery,
    onSuccess: (run) => {
      setInitial(run);
    },
  });
  const savedId = savedSearch.success ? savedSearch.data.id : null;
  const latest = useQuery({
    queryKey: ["discovery", "latest"],
    queryFn: () => getLatestDiscovery({}),
    enabled: !initial && !savedId && !search.isPending,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
  const recoveryError = !initial && !savedId && latest.isError;
  const runId = initial?.id ?? savedId ?? latest.data?.id ?? null;
  // Only a mounted screen updates its URL; a finished start request must not undo navigation.
  useEffect(() => {
    if (initial && savedId !== initial.id) rememberSearch(initial.id);
  }, [initial, savedId, rememberSearch]);
  const status = useQuery({
    queryKey: ["discovery", runId],
    queryFn: () => getDiscovery({ id: runId! }),
    enabled: Boolean(runId),
    initialData: initial ?? undefined,
    refetchInterval: (query) =>
      query.state.error
        ? false
        : query.state.data &&
            ["failed", "completed"].includes(query.state.data.status)
          ? false
          : 3000,
    retry: 1,
  });
  const run = search.isPending ? null : (status.data ?? initial);
  useEffect(() => {
    if (run?.status === "completed")
      void client.invalidateQueries({ queryKey: ["properties"] });
  }, [client, run?.id, run?.status]);
  const busy =
    search.isPending ||
    (!runId && latest.isFetching) ||
    (!status.isError &&
      Boolean(runId) &&
      (status.isPending ||
        Boolean(run && ["queued", "running"].includes(run.status))));
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    const draft = form.getValues();
    const input = startDiscoveryInputSchema.safeParse(draft);
    setInvalid(!input.success);
    if (!input.success) return;
    setInitial(null);
    rememberSearch(null);
    setSaveError(false);
    search.mutate(input.data);
  }
  const content = (
    <>
      <DialogHeader className="shrink-0 pr-8">
        <DialogTitle>{t("discoverTitle")}</DialogTitle>
        <DialogDescription>{t("discoverDescription")}</DialogDescription>
      </DialogHeader>
      <form
        className="max-h-[60dvh] shrink-0 space-y-4 overflow-y-auto border-b pb-5 sm:overflow-visible"
        onSubmit={submit}
      >
        <fieldset
          disabled={busy}
          className="grid gap-4 sm:grid-cols-[1fr_1fr_0.7fr]"
        >
          <div className="space-y-2">
            <Label htmlFor="search-query">{t("searchName")}</Label>
            <Input
              id="search-query"
              {...form.register("query")}
              maxLength={200}
            />
          </div>
          <LocationAutocomplete
            value={location}
            country={country}
            selected={Boolean(selectedLocation)}
            disabled={busy}
            invalid={false}
            onChange={(value) => {
              form.setValue("location", value);
              form.setValue("selectedLocation", null);
            }}
            onSelect={(place) => {
              form.setValue("location", place.label);
              form.setValue("selectedLocation", place);
            }}
          />
          <div className="space-y-2">
            <Label htmlFor="search-country">{t("country")}</Label>
            <Choice
              id="search-country"
              label={t("country")}
              value={country}
              disabled={busy}
              options={countries}
              onChange={(value) => {
                form.setValue("country", value);
                form.setValue("selectedLocation", null);
              }}
            />
          </div>
          <details className="self-start rounded-lg border p-3 sm:col-span-3">
            <summary className="cursor-pointer text-sm font-medium">
              {t("searchByLink")}
            </summary>
            <div className="mt-3 space-y-2">
              <Label htmlFor="search-url">{t("url")}</Label>
              <Input
                id="search-url"
                {...form.register("url")}
                type="url"
                placeholder="https://maps.google.com/…"
              />
              <p className="text-xs text-muted-foreground">
                {t("searchByLinkHint")}
              </p>
            </div>
          </details>
        </fieldset>
        {invalid ? (
          <p role="alert" className="text-sm text-destructive">
            {t("discoveryInvalid")}
          </p>
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          {t(busy ? "searching" : "search")}
        </Button>
      </form>
      <div
        aria-live="polite"
        className="min-h-0 overflow-y-auto overscroll-contain pr-1"
      >
        {saveError ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {t("saveError")}
          </p>
        ) : null}
        {run ? <Badge variant="secondary">{t(run.status)}</Badge> : null}
        {run && ["queued", "running"].includes(run.status) ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {t("discoveryProgress")}
          </p>
        ) : null}
        {search.isError || run?.status === "failed" ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {t(
              run?.error === "APIFY_NOT_CONFIGURED"
                ? "apifyMissing"
                : run?.error === "DISCOVERY_TIMED_OUT"
                  ? "discoveryTimeout"
                  : "discoveryError",
            )}
          </p>
        ) : null}
        {status.isError || recoveryError ? (
          <div role="alert" className="mt-3">
            <p className="text-sm text-destructive">{t("pollError")}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={() =>
                recoveryError ? latest.refetch() : status.refetch()
              }
            >
              {t("retryStatus")}
            </Button>
          </div>
        ) : null}
        {run && (run.results.length > 0 || run.status === "completed") ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{t("identity")}</p>
            {run.results.length ? (
              run.results.map((listing) => (
                <div
                  className="flex flex-wrap items-start justify-between gap-3 border-t pt-4"
                  key={listing.sourceId}
                >
                  <ListingThumbnail listing={listing} />
                  <div className="min-w-0 flex-1 basis-36">
                    <p className="font-medium break-words">{listing.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground break-words">
                      {listing.address} {listing.country}
                    </p>
                    <ListingDetails listing={listing} />
                    <a
                      href={listing.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-primary"
                    >
                      {t("source")}
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      saving ||
                      run.status !== "completed" ||
                      selected.includes(listing.sourceId)
                    }
                    onClick={async () => {
                      setSaving(true);
                      setSaveError(false);
                      try {
                        await onConfirm(listing);
                        setOpen(false);
                      } catch {
                        setSaveError(true);
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    {t(
                      selected.includes(listing.sourceId)
                        ? "saved"
                        : saving
                          ? "saving"
                          : "confirm",
                    )}
                  </Button>
                </div>
              ))
            ) : (
              <p>{t("noResults")}</p>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!saving) setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button">
          <Plus aria-hidden="true" className="size-4" />
          {t("addProperty")}
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90dvh] flex-col overflow-hidden p-5 sm:max-w-4xl sm:p-6"
      >
        {content}
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-3 right-3"
            disabled={saving}
            aria-label={t("closeDiscovery")}
          >
            <X aria-hidden="true" />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
