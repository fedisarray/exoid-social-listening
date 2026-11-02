import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChartNoAxesCombined, FolderOpen, LogOut } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
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
      <aside className="bg-sidebar text-sidebar-foreground flex flex-col lg:sticky lg:top-0 lg:h-screen">
        <Link
          href="/analyses"
          className="flex items-center gap-3 px-6 py-7 font-semibold"
        >
          <ChartNoAxesCombined className="size-6" />
          {t("brand")}
        </Link>
        <div className="px-6 pb-5 text-sm opacity-70">{t("workspace")}</div>
        <nav className="px-3 pb-4">
          <Link
            href="/analyses"
            className="flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-3"
          >
            <FolderOpen className="size-4" />
            {t("analyses")}
          </Link>
        </nav>
        <div className="mt-auto hidden px-6 py-6 text-sm opacity-60 lg:block">
          {t("privateWorkspace")}
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-end gap-3 border-b bg-card px-5 py-4 md:px-10">
          <span className="mr-auto max-w-full truncate text-sm text-muted-foreground">
            {email}
          </span>
          <LanguageSwitcher />
          <form action={signOut}>
            <Button variant="ghost" size="sm">
              <LogOut className="size-4" />
              {t("signOut")}
            </Button>
          </form>
        </header>
        <main className="mx-auto max-w-7xl p-5 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
