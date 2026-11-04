"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Building2, Folders } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkspaceNavigation() {
  const t = useTranslations("app");
  const pathname = usePathname();
  const linkClass = (active: boolean) =>
    cn(
      "flex min-h-11 shrink-0 items-center gap-3 rounded-lg whitespace-nowrap px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring",
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        : "text-sidebar-foreground/80",
    );
  return (
    <nav
      aria-label={t("navigation")}
      className="space-y-3 px-3 pb-4 lg:space-y-7 lg:pb-5"
    >
      <div className="flex flex-wrap gap-1 lg:block">
        <p className="hidden px-3 pb-2 text-xs lg:block font-medium text-sidebar-foreground/60">
          {t("workspaceSections")}
        </p>
        <Link
          href="/properties"
          className={linkClass(pathname.startsWith("/properties"))}
          aria-current={pathname.startsWith("/properties") ? "page" : undefined}
        >
          <Building2 className="size-4 shrink-0" />
          {t("properties")}
        </Link>
        <Link
          href="/analyses"
          className={linkClass(pathname.startsWith("/analyses"))}
          aria-current={pathname.startsWith("/analyses") ? "page" : undefined}
        >
          <Folders className="size-4 shrink-0" />
          {t("comparisons")}
        </Link>
      </div>
    </nav>
  );
}
