"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Building2,
  Folders,
  FileDown,
  LayoutDashboard,
  ChartLine,
  Users,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";

export function WorkspaceNavigation() {
  const t = useTranslations("app");
  const pathname = usePathname();
  const search = useSearchParams();
  const { setOpenMobile } = useSidebar();
  const isComparisonDashboard = /^\/analyses\/[^/]+\/dashboard$/.test(pathname);
  const sections = [
    { value: "overview", label: "overview", icon: LayoutDashboard },
    { value: "trends", label: "trends", icon: ChartLine },
    { value: "shared", label: "sharedSection", icon: Users },
    { value: "evidence", label: "evidenceSection", icon: MessageSquareText },
    { value: "ai", label: "aiAnalysis", icon: Sparkles },
  ] as const;
  const requestedSection = search.get("section");
  const section = sections.some(({ value }) => value === requestedSection)
    ? requestedSection
    : "overview";
  return (
    <nav aria-label={t("navigation")}>
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
          {t("workspaceSections")}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-1">
            {(
              [
                { href: "/properties", label: "properties", icon: Building2 },
                { href: "/analyses", label: "comparisons", icon: Folders },
                { href: "/exports", label: "exports", icon: FileDown },
              ] as const
            ).map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    className="rounded-sm text-slate-600 transition-colors duration-150 hover:bg-primary/5 hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-primary motion-reduce:transition-none"
                  >
                    <Link
                      href={href}
                      aria-current={pathname === href ? "page" : undefined}
                      onClick={() => setOpenMobile(false)}
                    >
                      <Icon aria-hidden="true" />
                      <span>{t(label)}</span>
                    </Link>
                  </SidebarMenuButton>
                  {href === "/analyses" && isComparisonDashboard ? (
                    <SidebarMenuSub>
                      {sections.map(({ value, label, icon: Icon }) => {
                        const next = new URLSearchParams(search.toString());
                        next.set("section", value);
                        const active = section === value;
                        return (
                          <SidebarMenuSubItem key={value}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={active}
                              className="rounded-sm text-slate-600 transition-colors duration-150 hover:bg-primary/5 hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-primary motion-reduce:transition-none"
                            >
                              <Link
                                href={`${pathname}?${next}`}
                                scroll={false}
                                prefetch={false}
                                aria-current={active ? "page" : undefined}
                                onClick={() => setOpenMobile(false)}
                                onNavigate={(event) => {
                                  event.preventDefault();
                                  const url = new URL(window.location.href);
                                  url.searchParams.set("section", value);
                                  if (url.href !== window.location.href)
                                    window.history.pushState(null, "", url);
                                }}
                              >
                                <Icon aria-hidden="true" />
                                <span>{t(label)}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </nav>
  );
}
