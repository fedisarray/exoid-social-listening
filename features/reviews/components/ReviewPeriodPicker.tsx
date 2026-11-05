"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarRange, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PeriodFields } from "@/features/analyses/components/PeriodFields";
import type { Period } from "@/features/_shared/schemas/period";

export function ReviewPeriodPicker({
  period,
  onChange,
  children,
}: {
  period: Period;
  onChange: (period: Period) => void;
  children: ReactNode;
}) {
  const t = useTranslations("app");
  const locale = useLocale();
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  const range = date
    .formatRange(
      new Date(`${period.start}T00:00:00Z`),
      new Date(`${period.end}T00:00:00Z`),
    )
    .replace(/\s/g, " ");

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      <span className="text-sm font-medium">{t("periodFilters")}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-10 max-w-full justify-start py-2 text-left whitespace-normal"
          >
            <CalendarRange className="size-4" aria-hidden="true" />
            <span className="sr-only">{t("periodFilters")}: </span>
            {range}
            <ChevronDown className="size-4" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          collisionPadding={20}
          className="max-h-[var(--radix-popover-content-available-height)] w-[min(40rem,calc(100vw-2.5rem))] overflow-y-auto p-5"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <PeriodFields value={period} onChange={onChange} />
            <div>{children}</div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
