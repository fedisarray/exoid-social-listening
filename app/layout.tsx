import "./globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";

const interfaceFont = Manrope({
  subsets: ["latin"],
  variable: "--font-interface",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Providers } from "@/components/providers";
import { WorkspaceBackdrop } from "@/features/_shared/components/WorkspaceBackdrop";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app");
  return {
    title: t("brand"),
    applicationName: t("brand"),
    description: t("metadataDescription"),
    robots: { index: false, follow: false },
    openGraph: {
      title: t("brand"),
      description: t("metadataDescription"),
      siteName: t("brand"),
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t("brand"),
      description: t("metadataDescription"),
    },
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  return (
    <html lang={locale} className={interfaceFont.variable}>
      <body className="relative isolate min-h-dvh">
        <WorkspaceBackdrop className="fixed -z-10" />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
