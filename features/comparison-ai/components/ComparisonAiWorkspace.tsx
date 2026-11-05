"use client";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Upload,
  SendHorizontal,
  LoaderCircle,
  ExternalLink,
  Bot,
  ArrowDown,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import type { Period } from "@/features/_shared/schemas/period";
import {
  comparisonAiWorkspaceSchema,
  type ComparisonAiWorkspace,
} from "../schemas/workspace";
import { ComparisonAiMessage } from "./ComparisonAiMessage";
import { comparisonAiEN } from "../locales/en";
import { readComparisonAiStream } from "../client/readComparisonAiStream";
import { prepareComparisonAiSnapshotsOutputSchema } from "../schemas/prepareComparisonAiSnapshotsOutput";

type Evidence = {
  id: string;
  text: string;
  date: string | null;
  rating: number | null;
  listing: string | null;
  sheet: string;
  row: number;
  sourceUrl: string | null;
};
type EvidenceResult = { reviews: Evidence[]; total: number };
function apiError(body: unknown): string {
  return body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string"
    ? body.error
    : "REQUEST_FAILED";
}

export function ComparisonAiWorkspace({
  analysisId,
  period,
  snapshotIds,
}: {
  analysisId: string;
  period: Period;
  snapshotIds: string[];
}) {
  const t = useTranslations("comparisonAi");
  const locale = useLocale();
  const copy = (key: string) => t(key as keyof typeof comparisonAiEN);
  const [workspace, setWorkspace] = useState<ComparisonAiWorkspace>({
    imports: [],
    messages: [],
  });
  const [loaded, setLoaded] = useState(false);
  const [dataConfigOpen, setDataConfigOpen] = useState(false);
  const [selectedImport, setSelectedImport] = useState("");
  const [prompt, setPrompt] = useState("");
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [busy, setBusy] = useState(false);
  const streamRef = useRef<AbortController | null>(null);
  const [pendingReply, setPendingReply] = useState<{
    importId: string;
    question: string;
    answer: string;
    periodStart: string;
    periodEnd: string;
  } | null>(null);
  useEffect(() => () => streamRef.current?.abort(), [analysisId]);
  const [error, setError] = useState("");
  const [evidence, setEvidence] = useState<EvidenceResult | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceError, setEvidenceError] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceFilter, setEvidenceFilter] = useState<{
    kind: string;
    value: string;
  } | null>(null);
  const [evidencePeriod, setEvidencePeriod] = useState(period);
  const [evidenceOffset, setEvidenceOffset] = useState(0);
  const [evidenceBusy, setEvidenceBusy] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/analyses/${analysisId}/ai`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("REQUEST_FAILED");
    const data = comparisonAiWorkspaceSchema.parse(await response.json());
    setWorkspace(data);
    setSelectedImport((current) => current || data.imports[0]?.id || "");
    setLoaded(true);
  }, [analysisId]);
  useEffect(() => {
    let active = true;
    void fetch(`/api/analyses/${analysisId}/ai`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("REQUEST_FAILED");
        return comparisonAiWorkspaceSchema.parse(await response.json());
      })
      .then((data) => {
        if (!active) return;
        setWorkspace(data);
        setSelectedImport(data.imports[0]?.id ?? "");
        setLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        setError("REQUEST_FAILED");
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [analysisId]);
  const processing = workspace.messages.some(
    (message) =>
      message.job && ["queued", "running"].includes(message.job.status),
  );
  useEffect(() => {
    const input = promptRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 128)}px`;
  }, [prompt]);
  useEffect(() => {
    if (!processing || busy) return;
    const timer = window.setInterval(() => {
      void refresh().catch(() => undefined);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [processing, busy, refresh]);

  const selected =
    workspace.imports.find((item) => item.id === selectedImport) ?? null;
  async function prepareSnapshots() {
    if (!snapshotIds.length) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/analyses/${analysisId}/ai/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshotIds }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(apiError(result));
      const prepared = prepareComparisonAiSnapshotsOutputSchema.parse(result);
      await refresh();
      setSelectedImport(prepared.importId);
      setDataConfigOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "REQUEST_FAILED");
    } finally {
      setBusy(false);
    }
  }

  async function sendPrompt(event?: FormEvent, suggestion?: string) {
    event?.preventDefault();
    const message = (suggestion ?? prompt).trim();
    if (
      !selected ||
      selected.kind !== "review_rows" ||
      !message ||
      busy ||
      streamRef.current
    )
      return;
    setError("");
    setBusy(true);
    setEvidence(null);
    setPrompt(message);
    setPendingReply({
      importId: selected.id,
      question: message,
      answer: "",
      periodStart: period.start,
      periodEnd: period.end,
    });
    const cancellation = new AbortController();
    streamRef.current = cancellation;
    try {
      const response = await fetch(`/api/analyses/${analysisId}/ai/chat`, {
        signal: cancellation.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          importId: selected.id,
          period,
          message,
          locale,
        }),
      });
      if (!response.ok) throw new Error(apiError(await response.json()));
      if (!response.body) throw new Error("REQUEST_FAILED");
      const result = await readComparisonAiStream(response.body, (answer) => {
        setPendingReply((current) =>
          current ? { ...current, answer } : current,
        );
      });
      await refresh();
      setPrompt("");
      if (result.jobId && !result.workerStarted) setError("WORKER_UNAVAILABLE");
    } catch (caught) {
      if (!cancellation.signal.aborted) {
        setError(caught instanceof Error ? caught.message : "REQUEST_FAILED");
        // Reload any persisted question; partial replies are never confirmed messages.
        await refresh().catch(() => undefined);
      }
    } finally {
      streamRef.current = null;
      setPendingReply(null);
      setBusy(false);
    }
  }

  async function openEvidence(
    filter: { kind: string; value: string },
    scopedPeriod = period,
    offset = 0,
    append = false,
  ) {
    if (!selected) return;
    setEvidenceOpen(true);
    setEvidenceTitle(filter.value);
    setEvidenceError(false);
    setEvidenceBusy(true);
    if (!append) setEvidence(null);
    const query = new URLSearchParams({
      importId: selected.id,
      kind: filter.kind,
      value: filter.value,
      periodKind: scopedPeriod.kind,
      year: String(scopedPeriod.year),
      quarter: String(scopedPeriod.quarter),
      cutoff: scopedPeriod.cutoff,
      start: scopedPeriod.start,
      end: scopedPeriod.end,
      offset: String(offset),
    });
    try {
      const response = await fetch(
        `/api/analyses/${analysisId}/ai/evidence?${query}`,
      );
      const result = await response.json();
      if (!response.ok) throw new Error(apiError(result));
      setEvidence((current) =>
        append && current
          ? {
              total: result.total,
              reviews: [...current.reviews, ...result.reviews],
            }
          : (result as EvidenceResult),
      );
      setEvidenceTitle(filter.value);
      setEvidenceFilter(filter);
      setEvidencePeriod(scopedPeriod);
      setEvidenceOffset(offset + (result.reviews as Evidence[]).length);
    } catch {
      setEvidenceError(true);
    } finally {
      setEvidenceBusy(false);
    }
  }

  function errorText() {
    if (!error) return "";
    const key = `error_${error}`;
    if (t.has(key as keyof typeof comparisonAiEN)) return copy(key);
    return error === "WORKER_UNAVAILABLE"
      ? copy("workerUnavailable")
      : copy("error");
  }

  function messagePeriod(start: string, end: string) {
    const date = new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeZone: "UTC",
    });
    return date.formatRange(
      new Date(`${start}T00:00:00Z`),
      new Date(`${end}T00:00:00Z`),
    );
  }

  const visibleMessages: ComparisonAiWorkspace["messages"] = [
    ...workspace.messages,
    ...(pendingReply
      ? (["user", "assistant"] as const).map((role) => ({
          id: `pending-${role}`,
          importId: pendingReply.importId,
          role,
          locale: locale as "it" | "en",
          content:
            role === "user" ? pendingReply.question : pendingReply.answer,
          periodStart: pendingReply.periodStart,
          periodEnd: pendingReply.periodEnd,
          createdAt: "",
          citations: [],
          visualization: null,
          job: null,
        }))
      : []),
  ];
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {error && !dataConfigOpen ? (
        <p role="alert" className="text-sm text-destructive">
          {errorText()}
        </p>
      ) : null}
      <Dialog open={evidenceOpen} onOpenChange={setEvidenceOpen}>
        <DialogContent className="flex max-h-[85dvh] flex-col overflow-hidden sm:max-w-4xl">
          <div className="shrink-0 space-y-2 pr-6">
            <DialogTitle>
              {copy("evidenceTitle")}: {evidenceTitle}
            </DialogTitle>
            <DialogDescription>
              {evidence
                ? `${evidence.total} ${copy("total")}`
                : copy("evidenceTitle")}
            </DialogDescription>
          </div>
          <div
            className="min-h-0 space-y-3 overflow-y-auto"
            aria-live="polite"
            aria-busy={evidenceBusy}
          >
            {evidenceError ? (
              <p role="alert" className="text-sm text-destructive">
                {copy("error")}
              </p>
            ) : evidenceBusy && !evidence ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : evidence?.reviews.length ? (
              <>
                {evidence.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-md border p-3 text-sm"
                  >
                    <p className="whitespace-pre-wrap">{review.text}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {review.listing ?? "—"} · {review.date ?? "—"} ·{" "}
                      {t("rowCitation", {
                        sheet: review.sheet,
                        row: review.row,
                      })}
                      {review.rating ? ` · ${review.rating}★` : ""}
                      {review.sourceUrl ? (
                        <>
                          {" "}
                          ·{" "}
                          <a
                            href={review.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 underline"
                          >
                            {copy("sourceLink")}
                            <ExternalLink className="size-3" />
                          </a>
                        </>
                      ) : null}
                    </p>
                  </article>
                ))}
                {evidence.reviews.length < evidence.total && evidenceFilter ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={evidenceBusy}
                    onClick={() =>
                      void openEvidence(
                        evidenceFilter,
                        evidencePeriod,
                        evidenceOffset,
                        true,
                      )
                    }
                  >
                    {copy("loadMore")}
                  </Button>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {copy("noEvidence")}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={dataConfigOpen} onOpenChange={setDataConfigOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <DialogTitle>{copy("prepareTitle")}</DialogTitle>
                <DialogDescription className="mt-2">
                  {t("prepareDescription", { count: snapshotIds.length })}
                </DialogDescription>
              </div>
              <Button
                type="button"
                onClick={prepareSnapshots}
                disabled={busy || !snapshotIds.length}
              >
                {busy ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {copy(busy ? "preparing" : "prepare")}
              </Button>
            </div>
            {workspace.imports.length ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                <label
                  className="text-sm font-medium"
                  htmlFor="comparison-ai-snapshot"
                >
                  {copy("preparedSnapshots")}
                </label>
                <select
                  id="comparison-ai-snapshot"
                  value={selectedImport}
                  disabled={busy}
                  onChange={(event) => setSelectedImport(event.target.value)}
                  className="min-h-10 w-full min-w-0 sm:w-auto sm:min-w-64 rounded-md border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {workspace.imports.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sourceLabel} · {item.rowCount} {copy("total")}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground">
                  {copy("workbookDescription")}
                </p>
                {selected ? (
                  <a
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4"
                    download
                    href={`/api/analyses/${analysisId}/ai/workbook?${new URLSearchParams(
                      {
                        importId: selected.id,
                        ...Object.fromEntries(
                          Object.entries(period).map(([key, value]) => [
                            key,
                            String(value),
                          ]),
                        ),
                      },
                    )}`}
                  >
                    <Image
                      src="/icons/excel.svg"
                      alt=""
                      width={16}
                      height={16}
                      aria-hidden="true"
                    />
                    {copy("downloadWorkbook")}
                  </a>
                ) : null}
              </div>
            ) : !loaded ? (
              <p className="text-sm text-muted-foreground">{copy("loading")}</p>
            ) : !snapshotIds.length ? (
              <p className="text-sm text-muted-foreground">
                {copy("noSnapshots")}
              </p>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {errorText()}
            </p>
          ) : null}
        </DialogContent>
      </Dialog>
      <section
        aria-label={copy("chat")}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2 sm:px-4">
          <h3 className="font-semibold">{copy("chat")}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDataConfigOpen(true)}
          >
            <Settings2 className="size-4" aria-hidden="true" />
            {copy("reviewData")}
          </Button>
          <p className="text-sm text-muted-foreground">
            {selected?.kind === "review_rows"
              ? t("chatContext", {
                  snapshot: t("reviewCount", { count: selected.rowCount }),
                  period: messagePeriod(period.start, period.end),
                })
              : copy("chatNoSnapshot")}
          </p>
        </header>
        <MessageScrollerProvider
          key={selectedImport}
          autoScroll
          defaultScrollPosition="end"
        >
          <MessageScroller className="flex-1 bg-background">
            <MessageScrollerViewport aria-label={copy("chat")} tabIndex={0}>
              <MessageScrollerContent
                className="mx-auto w-full justify-end gap-6 px-3 py-4 sm:px-4 lg:w-3/5"
                aria-live="polite"
              >
                {selected?.kind !== "review_rows" ? (
                  <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center text-center">
                    <Bot
                      className="mx-auto size-12 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                    <h4 className="mt-4 text-lg font-semibold">
                      {copy(
                        snapshotIds.length
                          ? "chatNeedsPrepare"
                          : "chatNoSnapshots",
                      )}
                    </h4>
                    <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                      {copy("chatNeedsPrepareDescription")}
                    </p>
                    <Button
                      className="mt-5"
                      variant="outline"
                      onClick={prepareSnapshots}
                      disabled={busy || !snapshotIds.length}
                    >
                      <Upload className="size-4" aria-hidden="true" />
                      {copy(busy ? "preparing" : "prepare")}
                    </Button>
                  </div>
                ) : !visibleMessages.some(
                    (message) => message.importId === selectedImport,
                  ) ? (
                  <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center text-center">
                    <Bot
                      className="mx-auto size-12 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                    <h4 className="mt-4 text-lg font-semibold">
                      {copy("welcomeTitle")}
                    </h4>
                    <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                      {copy("welcomeDescription")}
                    </p>
                    <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                      {(
                        [
                          "sentimentPrompt",
                          "themesPrompt",
                          "trendPrompt",
                          "wordCloudPrompt",
                        ] as const
                      ).map((key) => (
                        <Button
                          key={key}
                          variant="outline"
                          className="h-auto justify-start py-3 text-left whitespace-normal"
                          disabled={busy}
                          onClick={() => void sendPrompt(undefined, copy(key))}
                        >
                          {copy(key)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}
                {visibleMessages
                  .filter((message) => message.importId === selectedImport)
                  .map((message) => (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={message.role === "user"}
                      className="w-full"
                    >
                      <ComparisonAiMessage
                        message={message}
                        periodLabel={messagePeriod(
                          message.periodStart,
                          message.periodEnd,
                        )}
                        onFilter={(filter) =>
                          void openEvidence(filter, {
                            ...period,
                            start: message.periodStart,
                            end: message.periodEnd,
                          })
                        }
                      />
                    </MessageScrollerItem>
                  ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton aria-label={copy("scrollToLatest")}>
              <ArrowDown className="size-4" aria-hidden="true" />
            </MessageScrollerButton>
          </MessageScroller>
        </MessageScrollerProvider>
        <form
          onSubmit={(event) => void sendPrompt(event)}
          className="shrink-0 border-t bg-background/80 p-2 sm:p-3"
        >
          <InputGroup className="mx-auto w-full rounded-xl bg-background shadow-none lg:w-3/5">
            <label className="sr-only" htmlFor="comparison-ai-prompt">
              {copy("prompt")}
            </label>
            <InputGroupTextarea
              ref={promptRef}
              id="comparison-ai-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void sendPrompt();
                }
              }}
              placeholder={copy("prompt")}
              rows={1}
              maxLength={2000}
              disabled={selected?.kind !== "review_rows" || busy}
              className="max-h-32 min-h-12 field-sizing-fixed px-4"
            />
            <InputGroupAddon align="block-end" className="justify-between">
              <span className="text-xs font-normal">
                {copy("composerHint")}
              </span>
              <Button
                type="submit"
                size="icon"
                aria-label={copy(busy ? "sending" : "send")}
                disabled={
                  busy || selected?.kind !== "review_rows" || !prompt.trim()
                }
              >
                {busy ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <SendHorizontal className="size-4" />
                )}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </form>
        {busy && !pendingReply ? (
          <p
            role="status"
            className="shrink-0 pb-2 text-center text-xs text-muted-foreground"
          >
            {copy("sending")}
          </p>
        ) : null}
      </section>
    </div>
  );
}
