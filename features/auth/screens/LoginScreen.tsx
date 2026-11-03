"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChartNoAxesCombined, ArrowRight, Mail } from "lucide-react";
import {
  requestLoginCodeInputSchema,
  type RequestLoginCodeInput,
} from "../schemas/requestLoginCodeInput";
import {
  verifyLoginCodeInputSchema,
  type VerifyLoginCodeInput,
} from "../schemas/verifyLoginCodeInput";
import { requestLoginCode } from "../actions/requestLoginCode";
import { verifyLoginCode } from "../actions/verifyLoginCode";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/features/_shared/components/LanguageSwitcher";
export function LoginScreen({ devInboxUrl }: { devInboxUrl?: string }) {
  const t = useTranslations("app");
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [sendError, setSendError] = useState(false);
  const [verifyError, setVerifyError] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const requestForm = useForm<RequestLoginCodeInput>({
    resolver: zodResolver(requestLoginCodeInputSchema),
    defaultValues: { email: "" },
  });
  const verifyForm = useForm<VerifyLoginCodeInput>({
    resolver: zodResolver(verifyLoginCodeInputSchema),
    defaultValues: { email: "", token: "" },
  });
  const busy =
    requestForm.formState.isSubmitting ||
    verifyForm.formState.isSubmitting ||
    resending;
  async function send(input: RequestLoginCodeInput) {
    setSendError(false);
    setVerifyError(false);
    setResent(false);
    try {
      const result = await requestLoginCode(input);
      if (!result.ok) {
        setSendError(true);
        return;
      }
      verifyForm.reset({ email: input.email, token: "" });
      setEmail(input.email);
    } catch {
      setSendError(true);
    }
  }
  async function verify(input: VerifyLoginCodeInput) {
    setVerifyError(false);
    try {
      const result = await verifyLoginCode(input);
      if (!result.ok) {
        setVerifyError(true);
        return;
      }
      router.replace("/analyses");
      router.refresh();
    } catch {
      setVerifyError(true);
    }
  }
  async function resend() {
    if (!email) return;
    setResending(true);
    setSendError(false);
    setVerifyError(false);
    setResent(false);
    try {
      const result = await requestLoginCode({ email });
      if (!result.ok) {
        setSendError(true);
        return;
      }
      verifyForm.reset({ email, token: "" });
      setResent(true);
    } catch {
      setSendError(true);
    } finally {
      setResending(false);
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
        <div className="m-auto w-full max-w-sm space-y-6 py-12">
          <div>
            <h2 className="text-2xl font-semibold">
              {t(email ? "checkInbox" : "signIn")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(email ? "otpHint" : "otpDescription")}
            </p>
          </div>
          {email ? (
            <form
              key="verify"
              onSubmit={verifyForm.handleSubmit(verify)}
              className="space-y-6"
            >
              <p className="break-words text-sm">
                {t("codeSentTo")} <strong>{email}</strong>
              </p>
              <input type="hidden" {...verifyForm.register("email")} />
              <div className="space-y-2">
                <Label htmlFor="otp">{t("otpCode")}</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  disabled={busy}
                  aria-invalid={
                    verifyError || Boolean(verifyForm.formState.errors.token)
                  }
                  aria-describedby={verifyError ? "code-error" : undefined}
                  className="h-12 text-center text-xl tracking-[0.3em] tabular-nums"
                  {...verifyForm.register("token")}
                />
              </div>
              {verifyError || verifyForm.formState.errors.token ? (
                <p
                  id="code-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {t("codeError")}
                </p>
              ) : null}
              <Button className="w-full" disabled={busy}>
                {t(
                  verifyForm.formState.isSubmitting
                    ? "signingIn"
                    : "verifyCode",
                )}
                <ArrowRight className="size-4" />
              </Button>
              <div className="flex flex-wrap justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={resend}
                >
                  {t(resending ? "sendingCode" : "resendCode")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => {
                    setEmail(null);
                    setSendError(false);
                    setVerifyError(false);
                    setResent(false);
                  }}
                >
                  {t("changeEmail")}
                </Button>
              </div>
            </form>
          ) : (
            <form
              key="request"
              onSubmit={requestForm.handleSubmit(send)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={busy}
                  aria-invalid={Boolean(requestForm.formState.errors.email)}
                  {...requestForm.register("email")}
                />
              </div>
              <Button className="w-full" disabled={busy}>
                <Mail className="size-4" />
                {t(
                  requestForm.formState.isSubmitting
                    ? "sendingCode"
                    : "sendCode",
                )}
              </Button>
            </form>
          )}
          {sendError ? (
            <p role="alert" className="text-sm text-destructive">
              {t("sendCodeError")}
            </p>
          ) : null}
          {resent ? (
            <p role="status" className="text-sm text-muted-foreground">
              {t("codeResent")}
            </p>
          ) : null}
          {devInboxUrl ? (
            <a
              className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
              href={devInboxUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Mail className="size-4" />
              {t("devInbox")}
            </a>
          ) : null}
          <p className="text-sm text-muted-foreground">{t("localLogin")}</p>
        </div>
      </section>
    </main>
  );
}
