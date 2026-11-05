"use client";

import { useTranslations } from "next-intl";
import { LoaderCircle } from "lucide-react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import type { ComparisonAiWorkspace } from "../schemas/workspace";
import { comparisonAiEN } from "../locales/en";
import { ComparisonAiVisualization } from "./ComparisonAiVisualization";
import { ComparisonAiMarkdown } from "./ComparisonAiMarkdown";

export function ComparisonAiMessage({
  message,
  periodLabel,
  onFilter,
}: {
  message: ComparisonAiWorkspace["messages"][number];
  periodLabel: string;
  onFilter: (filter: { kind: string; value: string }) => void;
}) {
  const t = useTranslations("comparisonAi");
  const copy = (key: string) => t(key as keyof typeof comparisonAiEN);
  return (
    <Message
      align={message.role === "user" ? "end" : "start"}
      className="gap-3"
    >
      <MessageContent className="gap-3">
        <p className="text-xs text-muted-foreground">{periodLabel}</p>
        <Bubble
          variant={message.role === "user" ? "muted" : "ghost"}
          align={message.role === "user" ? "end" : "start"}
        >
          <BubbleContent className="leading-relaxed">
            {message.role === "user" ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ComparisonAiMarkdown content={message.content} />
            )}
          </BubbleContent>
        </Bubble>
        {message.id === "pending-assistant" ? (
          <p
            role="status"
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <LoaderCircle
              className="size-3 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            {copy(message.content ? "streaming" : "sending")}
          </p>
        ) : null}
        {message.citations.length ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              {copy("citations")}
            </p>
            {message.citations.map((citation, index) => (
              <blockquote
                key={`${citation.reviewId}-${index}`}
                className="border-l pl-3 text-sm leading-relaxed"
              >
                <p>“{citation.quote}”</p>
                <cite className="mt-1 block text-xs not-italic text-muted-foreground">
                  {t("rowCitation", {
                    sheet: citation.sheet,
                    row: citation.row,
                  })}
                </cite>
              </blockquote>
            ))}
          </div>
        ) : null}
        {message.visualization ? (
          <ComparisonAiVisualization
            visualization={message.visualization}
            title={copy(`chart_${message.visualization.type}`)}
            t={copy}
            onFilter={onFilter}
          />
        ) : null}
        {message.job ? (
          <p className="text-xs text-muted-foreground">
            {message.job.status === "failed"
              ? copy("jobFailed")
              : message.job.status === "completed"
                ? `${message.job.total} ${copy("total")}`
                : t("jobRunning", {
                    processed: message.job.processed,
                    total: message.job.total,
                  })}
          </p>
        ) : null}
      </MessageContent>
    </Message>
  );
}
