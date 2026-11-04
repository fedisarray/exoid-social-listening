"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useProperties } from "../hooks/useProperties";
import type { Listing } from "@/features/_shared/schemas/listing";
import { ListingThumbnail } from "@/features/_shared/components/ListingThumbnail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
export function SavedPropertyPicker({
  selected,
  onConfirm,
}: {
  selected: string[];
  onConfirm: (listing: Listing) => void;
}) {
  const t = useTranslations("properties");
  const { query } = useProperties();
  const available =
    query.data?.filter((p) => !selected.includes(p.listing.sourceId)) ?? [];
  return (
    <div className="w-full space-y-2">
      <Select
        value=""
        disabled={query.isPending || available.length === 0}
        onValueChange={(id) => {
          const property = available.find((p) => p.id === id);
          if (property) onConfirm(property.listing);
        }}
      >
        <SelectTrigger className="w-full" aria-label={t("chooseSaved")}>
          <SelectValue placeholder={t("chooseSaved")} />
        </SelectTrigger>
        <SelectContent>
          {available.map((p) => (
            <SelectItem
              key={p.id}
              value={p.id}
              textValue={`${p.listing.name} · ${p.listing.address}`}
            >
              <ListingThumbnail listing={p.listing} className="size-10" />
              <span className="min-w-0">
                <span className="block font-medium">{p.listing.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {p.listing.address}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {query.isError ? (
        <div role="alert">
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
      <Link
        href="/properties"
        className="text-sm text-primary underline underline-offset-4"
      >
        {t("manage")}
      </Link>
    </div>
  );
}
