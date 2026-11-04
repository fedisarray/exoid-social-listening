"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Building2, Folders, FileDown } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

export function WorkspaceNavigation() {
  const t = useTranslations("app");
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
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
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpenMobile(false)}
                    >
                      <Icon aria-hidden="true" />
                      <span>{t(label)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </nav>
  );
}
