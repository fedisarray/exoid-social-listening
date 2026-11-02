"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Search, ExternalLink, LoaderCircle } from "lucide-react";
import { startDiscovery } from "../actions/startDiscovery";
import { getDiscovery } from "../actions/getDiscovery";
import { startDiscoveryInputSchema } from "../schemas/startDiscoveryInput";
import type { DiscoveryRun } from "../schemas/discoveryRun";
import type { Listing } from "@/features/_shared/schemas/listing";
import {
  Dialog,
  DialogContent,
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
  onConfirm: (listing: Listing) => void;
  selected: string[];
}) {
  const t = useTranslations("app");
  const [open, setOpen] = useState(false);
  const [initial, setInitial] = useState<DiscoveryRun | null>(null);
  const [invalid, setInvalid] = useState(false);
  const search = useMutation({
    mutationFn: startDiscovery,
    onSuccess: (run) => setInitial(run),
  });
  const status = useQuery({
    queryKey: ["discovery", initial?.id],
    queryFn: () => getDiscovery({ id: initial!.id }),
    enabled:
      Boolean(initial) && !["failed", "completed"].includes(initial!.status),
    initialData: initial ?? undefined,
    refetchInterval: (query) =>
      query.state.error
        ? false
        : query.state.data &&
            ["failed", "completed"].includes(query.state.data.status)
          ? false
          : 2000,
    retry: 1,
  });
  const run = status.data ?? initial;
  const busy =
    search.isPending ||
    Boolean(run && ["queued", "running"].includes(run.status));
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    const data = new FormData(event.currentTarget);
    const input = startDiscoveryInputSchema.safeParse({
      query: data.get("query"),
      location: data.get("location"),
      country: String(data.get("country")).toUpperCase(),
      url: data.get("url"),
    });
    setInvalid(!input.success);
    if (!input.success) return;
    setInitial(null);
    search.mutate(input.data);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Search className="size-4" />
          {t("addProperty")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("discoverTitle")}</DialogTitle>
          <DialogDescription>{t("discoverDescription")}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search-query">{t("searchName")}</Label>
              <Input id="search-query" name="query" maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-location">{t("location")}</Label>
              <Input id="search-location" name="location" maxLength={150} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-country">{t("country")}</Label>
              <Input
                id="search-country"
                name="country"
                defaultValue="IT"
                maxLength={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-url">{t("url")}</Label>
              <Input id="search-url" name="url" type="url" />
            </div>
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
        <div aria-live="polite">
          {run ? <Badge variant="secondary">{t(run.status)}</Badge> : null}
          {search.isError || run?.status === "failed" ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {t(
                run?.error === "APIFY_NOT_CONFIGURED"
                  ? "apifyMissing"
                  : "discoveryError",
              )}
            </p>
          ) : null}
          {status.isError ? (
            <div role="alert" className="mt-3">
              <p className="text-sm text-destructive">{t("pollError")}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => status.refetch()}
              >
                {t("retryStatus")}
              </Button>
            </div>
          ) : null}
          {run?.status === "completed" ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">{t("identity")}</p>
              {run.results.length ? (
                run.results.map((listing) => (
                  <div
                    className="flex flex-wrap items-start justify-between gap-3 border-t pt-4"
                    key={listing.sourceId}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{listing.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {listing.address} {listing.country}
                      </p>
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
                      disabled={selected.includes(listing.sourceId)}
                      onClick={() => {
                        onConfirm(listing);
                        setOpen(false);
                      }}
                    >
                      {t("confirm")}
                    </Button>
                  </div>
                ))
              ) : (
                <p>{t("noResults")}</p>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
