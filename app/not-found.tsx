import Link from "next/link";
import { getTranslations } from "next-intl/server";
export default async function NotFound() {
  const t = await getTranslations("app");
  return (
    <main className="exoid-workspace mx-auto my-8 max-w-2xl p-6 sm:p-10">
      <h1 className="page-title">{t("notFound")}</h1>
      <p className="my-5">{t("notFoundDescription")}</p>
      <Link href="/analyses" className="text-primary underline">
        {t("back")}
      </Link>
    </main>
  );
}
