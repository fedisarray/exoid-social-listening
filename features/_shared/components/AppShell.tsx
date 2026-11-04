import Link from "next/link";
import { Suspense } from "react";
import { WorkspaceNavigation } from "./WorkspaceNavigation";
import { WorkspaceHeaderProvider } from "./WorkspaceHeader";
import { WorkspaceHelp } from "./WorkspaceHelp";
import { getTranslations } from "next-intl/server";
import { ChartNoAxesCombined, LogOut } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { signOut } from "@/features/auth/actions/signOut";
import { Button } from "@/components/ui/button";
export async function AppShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const t = await getTranslations("app");
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[224px_1fr]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3"
      >
        {t("skipToContent")}
      </a>
      <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <Link
          href="/properties"
          className="flex items-center gap-3 px-6 py-4 lg:py-7 font-semibold"
        >
          <ChartNoAxesCombined className="size-6" />
          {t("brand")}
        </Link>
        <div className="hidden px-6 pb-5 lg:block text-sm leading-relaxed text-sidebar-foreground/80">
          {t("workspace")}
        </div>
        <Suspense>
          <WorkspaceNavigation />
        </Suspense>
        <div className="mt-auto border-t border-sidebar-border px-3 py-3 lg:py-5">
          <p className="break-all px-3 pb-3 text-sm text-sidebar-foreground/80">
            {email}
          </p>
          <div className="flex flex-wrap items-center gap-2 px-3 pb-3 text-foreground">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
          <form action={signOut} className="px-3 pb-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="size-4" />
              {t("signOut")}
            </Button>
          </form>
          <WorkspaceHelp />
          <p className="hidden px-3 pt-3 text-sm text-sidebar-foreground/60 lg:block">
            {t("privateWorkspace")}
          </p>
        </div>
      </aside>
      <div className="min-w-0">
        <WorkspaceHeaderProvider>
          <main
            id="main-content"
            className="mx-auto max-w-screen-2xl p-5 md:px-10 md:py-10 lg:p-6"
          >
            {children}
          </main>
        </WorkspaceHeaderProvider>
      </div>
    </div>
  );
}
