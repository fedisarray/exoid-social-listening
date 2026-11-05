"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const HeaderTarget = createContext<HTMLElement | null>(null);

export function WorkspaceHeaderProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const pathname = usePathname();
  const t = useTranslations("app");
  const isComparisonDashboard = /^\/analyses\/[^/]+\/dashboard$/.test(pathname);
  const title = pathname.startsWith("/exports")
    ? "exports"
    : pathname.startsWith("/analyses")
      ? "comparisons"
      : "properties";
  return (
    <HeaderTarget value={target}>
      <header className="sticky top-0 z-30 flex min-h-16 shrink-0 flex-wrap items-center gap-x-4 gap-y-3 bg-background/20 px-4 py-3 backdrop-blur-2xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger aria-label={t("toggleSidebar")} />
          <Separator orientation="vertical" className="h-4" />
          {isComparisonDashboard ? (
            <Link
              href="/analyses"
              className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t("back")}
            </Link>
          ) : (
            <span className="text-sm font-medium">{t(title)}</span>
          )}
        </div>
        <div
          ref={setTarget}
          className="flex w-full min-w-0 flex-wrap items-center justify-end gap-3 empty:hidden sm:w-auto sm:flex-1"
        />
      </header>
      {children}
    </HeaderTarget>
  );
}

export function WorkspaceHeader({ children }: { children: ReactNode }) {
  const target = useContext(HeaderTarget);
  return target ? createPortal(children, target) : null;
}
