"use client";
import { WorkspaceHeader } from "@/features/_shared/components/WorkspaceHeader";
import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  MapPin,
  ExternalLink,
  Download,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Property } from "../schemas/property";
import type { Period } from "@/features/_shared/schemas/period";
import type { GetReviewDashboardInput } from "@/features/reviews/schemas/getReviewDashboardInput";
import type { ReviewDashboard as ReviewData } from "@/features/reviews/schemas/getReviewDashboardOutput";
import { ReviewDashboard } from "@/features/reviews/components/ReviewDashboard";
import { PeriodFields } from "@/features/analyses/components/PeriodFields";
import { dashboardPeriod } from "@/features/analyses/domain/dashboardPeriod";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ListingThumbnail } from "@/features/_shared/components/ListingThumbnail";
import { ListingDetails } from "@/features/_shared/components/ListingDetails";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
export function PropertyDashboard({
  property,
  defaultPeriod,
  initial,
}: {
  property: Property;
  defaultPeriod: Period;
  initial: { input: GetReviewDashboardInput; data: ReviewData };
}) {
  const t = useTranslations("properties");
  const app = useTranslations("app");
  const locale = useLocale();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const collectionTrigger = useRef<HTMLElement | null>(null);
  function openCollection(event: MouseEvent<HTMLButtonElement>) {
    collectionTrigger.current = event.currentTarget;
    update({ collect: "1", section });
  }
  const router = useRouter();
  const path = usePathname();
  const search = useSearchParams();
  const collectionOpen =
    search.get("collect") === "1" || search.get("section") === "collection";
  const section = ["overview", "trends", "evidence"].includes(
    search.get("section") ?? "",
  )
    ? search.get("section")!
    : "overview";
  const sectionLabels = {
    overview: "overview",
    trends: "trends",
    evidence: "evidenceSection",
  } as const;
  const period = dashboardPeriod(
    defaultPeriod,
    Object.fromEntries(search.entries()),
  );
  const dateFormat = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const dateRange = `${dateFormat.format(new Date(`${period.start}T00:00:00Z`))} – ${dateFormat.format(new Date(`${period.end}T00:00:00Z`))}`;
  function update(patch: Record<string, string>) {
    const params = new URLSearchParams(search.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.replace(`${path}?${params}`, { scroll: false });
  }
  return (
    <>
      <Link
        href="/properties"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("back")}
      </Link>
      {section === "evidence" ? (
        <header className="mt-4 exoid-panel p-4 sm:p-5">
          <h1 className="text-xl font-semibold tracking-tight">
            {property.listing.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {property.listing.address}
          </p>
        </header>
      ) : section === "trends" ? (
        <header className="mt-4 flex flex-wrap items-start justify-between gap-4 exoid-panel p-4 sm:p-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ListingThumbnail
              listing={property.listing}
              className="size-12 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight break-words sm:text-2xl">
                {property.listing.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground break-words">
                {property.listing.address}
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={openCollection}>
            <Download aria-hidden="true" />
            {t("collect")}
          </Button>
        </header>
      ) : (
        <header className="mt-4 overflow-hidden exoid-panel">
          <div className="flex flex-wrap items-start gap-4 p-5 sm:p-6">
            <div className="min-w-0 flex-1">
              <h1 className="page-title break-words">
                {property.listing.name}
              </h1>
              <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span className="break-words">{property.listing.address}</span>
              </p>
              <details className="mt-3 text-sm text-muted-foreground">
                <summary className="cursor-pointer">
                  {t("placeDetails")}
                </summary>
                <ListingDetails
                  listing={property.listing}
                  showReviews={false}
                />
              </details>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" onClick={openCollection}>
                  <Download aria-hidden="true" />
                  {t("collect")}
                </Button>
                <Button asChild variant="outline">
                  <a
                    href={property.listing.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {app("librarySource")}
                    <ExternalLink aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>
            <ListingThumbnail
              listing={property.listing}
              loading="eager"
              className="order-first size-16 shrink-0 sm:size-24"
            />
            <iframe
              title={t("placeMap", { name: property.listing.name })}
              src={`https://www.google.com/maps?q=${encodeURIComponent([property.listing.name, property.listing.address, property.listing.country].filter(Boolean).join(", "))}&output=embed&hl=${locale}`}
              className="h-52 w-full rounded-lg border bg-muted lg:w-1/3 lg:self-stretch"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </header>
      )}
      <Tabs
        value={section}
        onValueChange={(value) => update({ section: value })}
        className="mt-5"
      >
        <TabsList className="h-auto w-full justify-start overflow-x-auto border bg-card p-1">
          {Object.keys(sectionLabels).map((value) => (
            <TabsTrigger key={value} value={value} className="flex-1 py-2">
              {t(
                value === "evidence"
                  ? "reviewsTab"
                  : value === "trends"
                    ? "trendsTab"
                    : "overviewTab",
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-4 flex flex-col gap-4">
          <WorkspaceHeader>
            <div className="flex min-w-0 items-center gap-3">
              <CalendarDays
                className="hidden size-5 shrink-0 text-primary sm:block"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {app("dateScope")}
                </p>
                <p className="mt-1 text-sm font-medium tabular-nums">
                  {dateRange}
                </p>
              </div>
            </div>
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="shrink-0" type="button">
                  {app("explore")}
                  <ChevronDown aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                collisionPadding={20}
                className="max-h-[var(--radix-popover-content-available-height)] w-[min(30rem,calc(100vw-2.5rem))] overflow-y-auto p-5"
              >
                <PeriodFields
                  value={period}
                  onChange={(value) =>
                    update(
                      Object.fromEntries(
                        Object.entries(value).map(([k, v]) => [k, String(v)]),
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-4 w-full"
                  onClick={() =>
                    router.replace(`${path}?section=${section}`, {
                      scroll: false,
                    })
                  }
                >
                  {app("reset")}
                </Button>
                <Button
                  className="mt-5 w-full"
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                >
                  {t("done")}
                </Button>
              </PopoverContent>
            </Popover>
          </WorkspaceHeader>
          <TabsContent value={section} className="min-w-0">
            <h2 className="sr-only">
              {app(sectionLabels[section as keyof typeof sectionLabels])}
            </h2>
            <ReviewDashboard
              section={section}
              onCollect={openCollection}
              collectionDialog={{
                open: collectionOpen,
                onOpenChange: (open) =>
                  update({ collect: open ? "1" : "", section }),
                onPeriodChange: (value) =>
                  update(
                    Object.fromEntries(
                      Object.entries(value).map(([key, value]) => [
                        key,
                        String(value),
                      ]),
                    ),
                  ),
                onCloseAutoFocus: () =>
                  collectionTrigger.current?.focus({ preventScroll: true }),
              }}
              input={{
                propertyId: property.id,
                period,
                ...(search.get("snapshot")
                  ? { snapshotId: search.get("snapshot")! }
                  : {}),
              }}
              initial={initial}
              version={1}
              listings={[
                {
                  ...property.listing,
                  label: property.listing.name,
                  role: "primary",
                },
              ]}
              role="all"
              onSnapshot={(id) =>
                update({ snapshot: id === "latest" ? "" : id })
              }
            />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
