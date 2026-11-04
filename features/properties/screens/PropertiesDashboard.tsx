"use client";
import { WorkspaceHeader } from "@/features/_shared/components/WorkspaceHeader";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Trash2,
  Plus,
  ArrowRight,
  LayoutGrid,
  Rows3,
  Table2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ListingSearch } from "@/features/discovery/components/ListingSearch";
import { PropertyReviewCard } from "@/features/reviews/components/PropertyReviewCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SavedPlacesTable } from "../components/SavedPlacesTable";
import { useProperties } from "../hooks/useProperties";
import type { PropertySummary } from "../schemas/listPropertiesOutput";
export function PropertiesDashboard({
  initial,
}: {
  initial: PropertySummary[];
}) {
  const t = useTranslations("properties");
  const { query, add, remove } = useProperties(initial);
  const [deleting, setDeleting] = useState<PropertySummary | null>(null);
  const deleteTrigger = useRef<HTMLButtonElement | null>(null);
  const savedHeading = useRef<HTMLHeadingElement | null>(null);
  const search = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const filter = search.get("q") ?? "";
  const requestedView = search.get("view");
  const view =
    requestedView === "cards" || requestedView === "rows"
      ? requestedView
      : "table";
  const properties = query.data ?? [];
  const shown = properties
    .filter((p) =>
      `${p.listing.name} ${p.listing.address} ${p.listing.country}`
        .toLocaleLowerCase()
        .includes(filter.toLocaleLowerCase()),
    )
    .toSorted(
      (a, b) => Number((b.reviews ?? 0) > 0) - Number((a.reviews ?? 0) > 0),
    );
  const requestedSize = Number(search.get("pageSize"));
  const pageSize = [10, 25, 50].includes(requestedSize) ? requestedSize : 10;
  const requestedPage = Number(search.get("page"));
  const pageCount = Math.max(1, Math.ceil(shown.length / pageSize));
  const page = Math.min(
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1,
    pageCount,
  );
  const pageStart = (page - 1) * pageSize;
  const pageItems = shown.slice(pageStart, pageStart + pageSize);
  const pageHref = (target: number) => {
    const params = new URLSearchParams(search.toString());
    params.set("page", String(target));
    return `${path}?${params}`;
  };
  return (
    <>
      <WorkspaceHeader>
        <form
          className="w-full space-y-2 sm:max-w-md"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const params = new URLSearchParams(search.toString());
            const q = String(data.get("q") ?? "").trim();
            params.delete("page");
            if (q) params.set("q", q);
            else params.delete("q");
            router.replace(`${path}?${params}`, { scroll: false });
          }}
        >
          <Label className="sr-only" htmlFor="property-filter">
            {t("filter")}
          </Label>
          <div className="flex gap-2">
            <Input
              key={filter}
              id="property-filter"
              name="q"
              defaultValue={filter}
              placeholder={t("filterPlaceholder")}
            />
            <Button type="submit" variant="outline">
              {t("search")}
            </Button>
          </div>
        </form>
      </WorkspaceHeader>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{t("title")}</h1>
          <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {properties.length > 0 ? (
            <Button asChild variant="outline">
              <Link href="/analyses/new">
                <Plus aria-hidden="true" />
                {t("compare")}
              </Link>
            </Button>
          ) : null}
          <ListingSearch
            selected={properties.map((p) => p.listing.sourceId)}
            onConfirm={async (listing) => {
              await add.mutateAsync({ sourceId: listing.sourceId });
            }}
          />
        </div>
      </div>
      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
          <h2
            ref={savedHeading}
            tabIndex={-1}
            className="text-lg font-semibold"
          >
            {t("saved")}{" "}
            <span className="ml-1 text-sm font-normal tabular-nums text-muted-foreground">
              {properties.length}
            </span>
          </h2>
          <div
            role="group"
            aria-label={t("viewMode")}
            className="flex flex-wrap gap-1 rounded-lg border bg-card p-1"
          >
            {(
              [
                { value: "table", label: "tableView", icon: Table2 },
                { value: "cards", label: "cardsView", icon: LayoutGrid },
                { value: "rows", label: "rowsView", icon: Rows3 },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={view === value ? "default" : "ghost"}
                aria-pressed={view === value}
                onClick={() => {
                  const params = new URLSearchParams(search.toString());
                  params.set("view", value);
                  router.replace(`${path}?${params}`, { scroll: false });
                }}
              >
                <Icon aria-hidden="true" />
                {t(label)}
              </Button>
            ))}
          </div>
        </div>
        {query.isError ? (
          <div role="alert" className="mt-4">
            <p className="text-sm text-destructive">{t("loadError")}</p>
            <Button
              className="mt-2"
              variant="outline"
              onClick={() => query.refetch()}
            >
              {t("retry")}
            </Button>
          </div>
        ) : null}
        {properties.length > 0 ? (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t("metricsScope")}
          </p>
        ) : null}
        {filter ? (
          <Button
            className="mt-3"
            variant="ghost"
            onClick={() => {
              const params = new URLSearchParams(search.toString());
              params.delete("q");
              params.delete("page");
              router.replace(`${path}?${params}`, { scroll: false });
            }}
          >
            {t("clearFilter")}
          </Button>
        ) : null}
        {shown.length ? (
          view === "table" ? (
            <SavedPlacesTable
              properties={pageItems}
              onDelete={(property, trigger) => {
                deleteTrigger.current = trigger;
                remove.reset();
                setDeleting(property);
              }}
            />
          ) : (
            <div
              className={cn(
                "mt-6 grid items-start gap-6 lg:gap-4",
                view === "cards" && "xl:grid-cols-2",
              )}
            >
              {pageItems.map((p) => (
                <PropertyReviewCard
                  compact
                  view={view}
                  key={p.id}
                  label={p.listing.name}
                  listing={p.listing}
                  href={`/properties/${p.id}`}
                  collectedAt={p.collectedAt}
                  covered={p.covered}
                  collectionPeriod={p.collectionPeriod}
                  ratingTrend={p.ratingTrend}
                  loading={false}
                  actions={
                    <div className="flex flex-wrap items-center gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/properties/${p.id}${p.reviews === null ? "?collect=1" : ""}`}
                        >
                          {t(p.reviews === null ? "collect" : "open")}
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={t("deleteNamed", { name: p.listing.name })}
                        onClick={(event) => {
                          deleteTrigger.current = event.currentTarget;
                          remove.reset();
                          setDeleting(p);
                        }}
                      >
                        <Trash2 aria-hidden="true" />
                        <span className="sr-only">{t("delete")}</span>
                      </Button>
                    </div>
                  }
                  status={p.status ?? undefined}
                  metric={
                    p.reviews === null
                      ? undefined
                      : {
                          reviews: p.reviews,
                          textReviews: p.textReviews ?? undefined,
                          ratedCount: p.ratedCount ?? 0,
                          rating: p.rating,
                          available:
                            p.status === "completed" ||
                            p.status === "partial" ||
                            p.reviews > 0,
                        }
                  }
                />
              ))}
            </div>
          )
        ) : (
          <div className="mt-5 rounded-xl border border-dashed px-6 py-12 text-center">
            <Building2
              className="mx-auto size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="mt-4 font-medium">
              {t(properties.length ? "noMatch" : "empty")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(properties.length ? "noMatchHint" : "emptyHint")}
            </p>
          </div>
        )}
        {shown.length > 0 ? (
          <nav
            aria-label={t("pagination")}
            className="mt-4 flex flex-wrap items-center justify-between gap-4"
          >
            <p
              role="status"
              className="text-sm tabular-nums text-muted-foreground"
            >
              {t("pageRange", {
                start: pageStart + 1,
                end: Math.min(pageStart + pageSize, shown.length),
                total: shown.length,
              })}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Label htmlFor="places-page-size">{t("pageSize")}</Label>
              <select
                id="places-page-size"
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                value={pageSize}
                onChange={(event) => {
                  const params = new URLSearchParams(search.toString());
                  params.set("pageSize", event.target.value);
                  params.delete("page");
                  router.replace(`${path}?${params}`, { scroll: false });
                }}
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm tabular-nums">
                {t("pageNumber", { page, total: pageCount })}
              </span>
              {page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={pageHref(page - 1)} scroll={false}>
                    <ChevronLeft aria-hidden="true" />
                    {t("previousPage")}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft aria-hidden="true" />
                  {t("previousPage")}
                </Button>
              )}
              {page < pageCount ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={pageHref(page + 1)} scroll={false}>
                    {t("nextPage")}
                    <ChevronRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  {t("nextPage")}
                  <ChevronRight aria-hidden="true" />
                </Button>
              )}
            </div>
          </nav>
        ) : null}
      </section>
      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) {
            setDeleting(null);
            remove.reset();
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const target = deleteTrigger.current?.isConnected
              ? deleteTrigger.current
              : savedHeading.current;
            target?.focus();
          }}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById("cancel-delete-property")?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {t("deleteTitle", { name: deleting?.listing.name ?? "" })}
            </DialogTitle>
            <DialogDescription>{t("deleteDescription")}</DialogDescription>
          </DialogHeader>
          {remove.isError ? (
            <p role="alert" className="text-sm text-destructive">
              {t("deleteError")}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              id="cancel-delete-property"
              type="button"
              variant="outline"
              disabled={remove.isPending}
              onClick={() => {
                setDeleting(null);
                remove.reset();
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (deleting)
                  remove.mutate(deleting.id, {
                    onSuccess: () => setDeleting(null),
                  });
              }}
            >
              {t(remove.isPending ? "deleting" : "delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
