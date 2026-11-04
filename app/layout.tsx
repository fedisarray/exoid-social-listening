import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const interfaceFont = Inter({
  subsets: ["latin"],
  variable: "--font-interface",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  fallback: ["Arial", "sans-serif"],
});
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Providers } from "@/components/providers";
export const metadata: Metadata = {
  title: "Exoid Reviews",
  description: "Retail review analysis workspace",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  return (
    <html lang={locale} className={interfaceFont.variable}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
