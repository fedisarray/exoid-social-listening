"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { useProperties } from "@/features/properties/hooks/useProperties";
import type { Listing } from "@/features/_shared/schemas/listing";
import { ListingThumbnail } from "@/features/_shared/components/ListingThumbnail";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import type { Selection } from "../schemas/analysisConfig";
import { Choice } from "@/features/_shared/components/Choice";
import { ListingDetails } from "@/features/_shared/components/ListingDetails";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
export function ComparisonPlacePicker({
  selected,
  onToggle,
  onRoleChange,
  onLabelChange,
  onMove,
}: {
  selected: Selection[];
  onToggle: (listing: Listing, checked: boolean) => void;
  onRoleChange: (index: number, role: Selection["role"]) => void;
  onLabelChange: (index: number, label: string) => void;
  onMove: (index: number, nextIndex: number) => void;
}) {
  const t = useTranslations("properties");
  const app = useTranslations("app");
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [filter, setFilter] = useState("");
  const { query } = useProperties();
  const term = filter.trim().toLocaleLowerCase();
  const places: Listing[] = [
    ...(query.data ?? []).map(({ listing }) => listing),
    ...selected.filter(
      (listing) =>
        !query.data?.some((item) => item.listing.sourceId === listing.sourceId),
    ),
  ].filter((listing) =>
    [listing.name, listing.address, listing.country]
      .join(" ")
      .toLocaleLowerCase()
      .includes(term),
  );
  const pageSize = 9;
  const pageCount = Math.max(1, Math.ceil(places.length / pageSize));
  const page = Math.min(
    pageCount,
    Math.max(1, Math.floor(Number(search.get("placesPage")) || 1)),
  );
  const pageStart = (page - 1) * pageSize;
  const pagePlaces = places.slice(pageStart, pageStart + pageSize);

  function changePage(nextPage: number) {
    const params = new URLSearchParams(search.toString());
    if (nextPage === 1) params.delete("placesPage");
    else params.set("placesPage", String(nextPage));
    router.replace(`${pathname}?${params}`, { scroll: false });
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          aria-label={t("filter")}
          placeholder={t("filterPlaceholder")}
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            changePage(1);
          }}
          className="sm:max-w-sm"
        />
        <p
          aria-live="polite"
          className="shrink-0 text-sm text-muted-foreground"
        >
          {t("selectedPlacesCount", { count: selected.length })}
        </p>
      </div>
      {query.isPending ? (
        <p role="status" className="py-4 text-sm text-muted-foreground">
          {t("loadingSaved")}
        </p>
      ) : query.isError ? (
        <div role="alert" className="space-y-2">
          <p className="text-sm text-destructive">{t("loadError")}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => query.refetch()}
          >
            {t("retry")}
          </Button>
        </div>
      ) : null}
      {places.length ? (
        <div
          role="group"
          aria-label={t("chooseSaved")}
          className="grid items-start gap-3 lg:grid-cols-2 xl:grid-cols-3"
        >
          {pagePlaces.map((listing) => {
            const index = selected.findIndex(
              (item) => item.sourceId === listing.sourceId,
            );
            const selection = selected[index];
            const checkboxId = `${id}-${listing.sourceId}`;
            return (
              <div
                key={listing.sourceId}
                className={cn(
                  "min-w-0 rounded-xl border p-3 transition-colors motion-reduce:transition-none",
                  selection
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card/50 hover:bg-accent",
                )}
              >
                <label
                  htmlFor={checkboxId}
                  className="flex min-w-0 cursor-pointer items-start gap-2"
                >
                  <Checkbox
                    id={checkboxId}
                    aria-label={`${listing.name} · ${listing.address}`}
                    checked={Boolean(selection)}
                    onCheckedChange={(checked) =>
                      onToggle(listing, checked === true)
                    }
                    className="mt-1"
                  />
                  <ListingThumbnail
                    listing={listing}
                    className="size-8 shrink-0 rounded-md [&>svg]:size-4"
                  />
                  <span className="min-w-0 space-y-1">
                    <span className="block text-sm font-semibold break-words">
                      {listing.name}
                    </span>
                    <span className="block text-xs leading-snug text-muted-foreground break-words">
                      {listing.address}
                    </span>
                  </span>
                </label>
                <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="min-w-0 space-y-1">
                      <Label className="text-xs" htmlFor={`${checkboxId}-role`}>
                        {app("role")}
                      </Label>
                      <Choice
                        id={`${checkboxId}-role`}
                        label={app("role")}
                        value={selection?.role ?? ""}
                        disabled={!selection}
                        onChange={(role) =>
                          onRoleChange(index, role as Selection["role"])
                        }
                        options={(
                          [
                            "primary",
                            "additionalOwn",
                            "competitor",
                            "anchor",
                          ] as const
                        ).map((role) => ({ value: role, label: app(role) }))}
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <Label
                        className="text-xs"
                        htmlFor={`${checkboxId}-label`}
                      >
                        {app("label")}
                      </Label>
                      <Input
                        id={`${checkboxId}-label`}
                        className="text-xs md:text-xs"
                        value={selection?.label ?? listing.name}
                        disabled={!selection}
                        maxLength={120}
                        onChange={(event) =>
                          onLabelChange(index, event.target.value)
                        }
                      />
                    </div>
                  </div>
                  <ListingDetails listing={listing} />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <a
                      href={listing.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary"
                    >
                      {app("source")}
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={app("moveUp")}
                        disabled={!selection || index === 0}
                        onClick={() => onMove(index, index - 1)}
                      >
                        <ArrowUp aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={app("moveDown")}
                        disabled={!selection || index === selected.length - 1}
                        onClick={() => onMove(index, index + 1)}
                      >
                        <ArrowDown aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !query.isPending && !query.isError ? (
        <p className="py-4 text-sm text-muted-foreground">
          {term ? t("noMatch") : t("noSavedPlaces")}
        </p>
      ) : null}
      {places.length > 0 ? (
        <nav
          aria-label={t("pagination")}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <p
            role="status"
            className="text-sm tabular-nums text-muted-foreground"
          >
            {t("pageRange", {
              start: pageStart + 1,
              end: Math.min(pageStart + pageSize, places.length),
              total: places.length,
            })}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm tabular-nums">
              {t("pageNumber", { page, total: pageCount })}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
            >
              <ChevronLeft aria-hidden="true" />
              {t("previousPage")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page === pageCount}
              onClick={() => changePage(page + 1)}
            >
              {t("nextPage")}
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </nav>
      ) : null}
      <Link
        href="/properties"
        className="inline-block text-sm text-primary underline underline-offset-4"
      >
        {t("manage")}
      </Link>
    </div>
  );
}
