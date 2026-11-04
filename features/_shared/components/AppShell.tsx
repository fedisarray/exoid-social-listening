import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { LogOut, UserRound } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions/signOut";
import { WorkspaceNavigation } from "./WorkspaceNavigation";
import { WorkspaceHeaderProvider } from "./WorkspaceHeader";
import { WorkspaceHelp } from "./WorkspaceHelp";
import { WorkspaceBackdrop } from "./WorkspaceBackdrop";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function AppShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const t = await getTranslations("app");
  return (
    <SidebarProvider className="exoid-shell relative isolate h-dvh min-h-0 overflow-hidden">
      <WorkspaceBackdrop className="opacity-60" />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3"
      >
        {t("skipToContent")}
      </a>
      <Sidebar
        variant="inset"
        collapsible="offcanvas"
        className="bg-transparent"
      >
        <SidebarHeader className="gap-3 p-4 pb-5">
          <div className="flex items-center gap-2">
            <Link
              href="/properties"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-sm text-sm font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Image
                src="/exoid-logo.svg"
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0"
              />
              {t("brand")}
            </Link>
            <SidebarTrigger
              aria-label={t("toggleSidebar")}
              className="md:hidden"
            />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("workspace")}
          </p>
        </SidebarHeader>
        <SidebarContent>
          <Suspense>
            <WorkspaceNavigation />
          </Suspense>
        </SidebarContent>
        <SidebarFooter className="gap-2 p-3">
          <WorkspaceHelp />
          <div className="rounded-sm bg-white/35 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <UserRound className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="break-all text-xs font-medium leading-relaxed">
                  {email}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("privateWorkspace")}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2">
              <LanguageSwitcher />
              <form action={signOut}>
                <Button variant="ghost" size="sm">
                  <LogOut className="size-4" aria-hidden="true" />
                  {t("signOut")}
                </Button>
              </form>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="exoid-workspace relative z-10 m-2 min-h-0 min-w-0 overflow-y-auto">
        <WorkspaceHeaderProvider>
          <div
            id="main-content"
            tabIndex={-1}
            className="relative z-10 mx-auto w-full max-w-screen-2xl p-4 outline-none sm:p-6 lg:p-8"
          >
            {children}
          </div>
        </WorkspaceHeaderProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
