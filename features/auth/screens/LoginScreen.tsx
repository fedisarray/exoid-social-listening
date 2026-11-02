"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChartNoAxesCombined, ArrowRight } from "lucide-react";
import { signInInputSchema, type SignInInput } from "../schemas/signInInput";
import { signIn } from "../actions/signIn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/features/_shared/components/LanguageSwitcher";
export function LoginScreen() {
  const t = useTranslations("app");
  const router = useRouter();
  const [error, setError] = useState(false);
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInInputSchema),
    defaultValues: { email: "", password: "" },
  });
  async function submit(input: SignInInput) {
    setError(false);
    try {
      const output = await signIn(input);
      if (!output.ok) {
        setError(true);
        return;
      }
      router.replace("/analyses");
      router.refresh();
    } catch {
      setError(true);
    }
  }
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <section className="bg-sidebar text-sidebar-foreground flex flex-col justify-between gap-12 p-8 lg:p-16">
        <div className="flex items-center gap-3 font-semibold">
          <ChartNoAxesCombined />
          {t("brand")}
        </div>
        <div className="max-w-lg">
          <h1 className="font-display text-5xl leading-tight md:text-6xl">
            {t("loginTitle")}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed opacity-75">
            {t("loginDescription")}
          </p>
        </div>
        <p className="text-sm opacity-60">{t("workspace")}</p>
      </section>
      <section className="flex flex-col p-6 md:p-12">
        <div className="self-end">
          <LanguageSwitcher />
        </div>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="m-auto w-full max-w-sm space-y-6 py-12"
        >
          <div>
            <h2 className="text-2xl font-semibold">{t("signIn")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("localLogin")}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              {...form.register("email")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              {...form.register("password")}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {t("loginError")}
            </p>
          ) : null}
          <Button className="w-full" disabled={form.formState.isSubmitting}>
            {t(form.formState.isSubmitting ? "signingIn" : "signIn")}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </section>
    </main>
  );
}
