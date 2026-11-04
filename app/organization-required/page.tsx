import { getTranslations } from "next-intl/server";
import { requireAuthenticatedUser } from "@/lib/auth/dal";
import { signOut } from "@/features/auth/actions/signOut";
import { Button } from "@/components/ui/button";
export default async function OrganizationRequiredPage() {
  await requireAuthenticatedUser();
  const t = await getTranslations("app");
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">
        {t("organizationRequiredTitle")}
      </h1>
      <p>{t("organizationRequiredDescription")}</p>
      <form action={signOut}>
        <Button>{t("signOut")}</Button>
      </form>
    </main>
  );
}
