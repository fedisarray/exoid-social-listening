"use client";

import { useState } from "react";
import { CircleHelp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function WorkspaceHelp() {
  const t = useTranslations("properties");
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
        >
          <CircleHelp className="size-4 shrink-0" aria-hidden="true" />
          {t("journey")}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={12}
        collisionPadding={20}
        aria-labelledby="workspace-help-title"
        className="max-h-[var(--radix-popover-content-available-height)] w-[min(22rem,calc(100vw-2.5rem))] overflow-y-auto p-5"
      >
        <h2 id="workspace-help-title" className="text-base font-semibold">
          {t("journey")}
        </h2>
        <ol className="mt-3 list-decimal space-y-4 pl-5 text-sm leading-relaxed marker:text-muted-foreground">
          {(["findStep", "collectStep", "compareStep"] as const).map((step) => (
            <li key={step} className="pl-1">
              {t(step)}
            </li>
          ))}
        </ol>
        <Button
          type="button"
          className="mt-5 w-full"
          onClick={() => setOpen(false)}
        >
          {t("done")}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
