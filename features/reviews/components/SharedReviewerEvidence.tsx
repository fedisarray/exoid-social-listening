"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSharedReviewerEvidence } from "../hooks/useSharedReviewerEvidence";
import type { GetSharedReviewerEvidenceInput } from "../schemas/getSharedReviewerEvidenceInput";
import type { SharedReviewerEvidence as Evidence } from "../schemas/getSharedReviewerEvidenceOutput";
import { SharedReviewRating } from "./SharedReviewRating";
import { cn } from "@/lib/utils";

function ReviewEvidence({
  review,
  label,
}: {
  review: Evidence["reviewers"][number]["primaryReview"];
  label: string;
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const url =
    review.url && /^https?:\/\//i.test(review.url) ? review.url : null;
  return (
    <section className="min-w-0">
      <h5 className="text-sm font-semibold break-words">{label}</h5>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <SharedReviewRating rating={review.rating} />
        <time dateTime={review.publishedAt}>
          {new Intl.DateTimeFormat(locale, {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          }).format(new Date(review.publishedAt))}
        </time>
        {review.language ? (
          <span>{t("reviewLanguage", { language: review.language })}</span>
        ) : null}
      </div>
      {review.text.trim() ? (
        <p
          className="mt-3 max-w-prose whitespace-pre-wrap break-words text-sm leading-relaxed"
          lang={review.language ?? undefined}
        >
          {review.text}
        </p>
      ) : (
        <p className="mt-3 text-sm italic text-muted-foreground">
          {t(review.rating === null ? "sharedEvidenceNoText" : "ratingOnly")}
        </p>
      )}
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("source")}
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      ) : null}
    </section>
  );
}

export function SharedReviewerEvidence({
  input,
  primaryLabel,
  competitorLabel,
  datasetKey,
}: {
  input: GetSharedReviewerEvidenceInput;
  primaryLabel: string;
  competitorLabel: string;
  datasetKey: string;
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const [offset, setOffset] = useState(0);
  const query = useSharedReviewerEvidence({ ...input, offset }, datasetKey);
  const evidence = query.data;
  return (
    <div className="mt-4" aria-busy={query.isFetching}>
      <details className="text-xs text-muted-foreground">
        <summary className="w-fit font-medium">
          {t("sharedEvidenceMethod")}
        </summary>
        <p className="mt-2 max-w-prose leading-relaxed">
          {t("sharedEvidenceNote")}
        </p>
      </details>
      {query.isPending ? (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          {t("sharedEvidenceLoading")}
        </p>
      ) : null}
      {query.isError ? (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-center gap-3 text-sm"
        >
          <p>{t("sharedEvidenceError")}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
          >
            {t("sharedEvidenceRetry")}
          </Button>
        </div>
      ) : null}
      {evidence && !evidence.available ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("comparisonBlocked")}
        </p>
      ) : null}
      {evidence?.available && !evidence.reviewers.length ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("sharedEvidenceEmpty")}
        </p>
      ) : null}
      {evidence?.available && evidence.reviewers.length ? (
        <>
          <p role="status" className="mt-4 text-xs text-muted-foreground">
            {t("sharedEvidencePage", {
              start: offset + 1,
              end: offset + evidence.reviewers.length,
              total: evidence.total,
            })}
          </p>
          <div className="mt-3 divide-y border-y">
            {evidence.reviewers.map((reviewer) => {
              const gap =
                reviewer.primaryReview.rating !== null &&
                reviewer.competitorReview.rating !== null
                  ? reviewer.primaryReview.rating -
                    reviewer.competitorReview.rating
                  : null;
              const days = Math.abs(
                Math.round(
                  (Date.parse(reviewer.primaryReview.publishedAt.slice(0, 10)) -
                    Date.parse(
                      reviewer.competitorReview.publishedAt.slice(0, 10),
                    )) /
                    86_400_000,
                ),
              );
              return (
                <article key={reviewer.reviewerId} className="py-5 sm:py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h4 className="min-w-0 break-all text-xs font-medium text-muted-foreground">
                      {t("sharedReviewerId", { id: reviewer.reviewerId })}
                    </h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{t("sharedReviewDays", { count: days })}</span>
                      <span
                        className={cn(
                          "tabular-nums",
                          gap !== null && gap < 0 && "text-metric-negative",
                          gap !== null && gap > 0 && "text-metric-positive",
                        )}
                      >
                        {t("sharedEvidenceGap", {
                          gap:
                            gap === null
                              ? t("unavailable")
                              : new Intl.NumberFormat(locale, {
                                  signDisplay: "exceptZero",
                                  maximumFractionDigits: 2,
                                }).format(gap),
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2 sm:gap-8">
                    <ReviewEvidence
                      review={reviewer.primaryReview}
                      label={primaryLabel}
                    />
                    <ReviewEvidence
                      review={reviewer.competitorReview}
                      label={competitorLabel}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : null}
      {evidence?.available && (offset > 0 || evidence.total > 20) ? (
        <nav
          aria-label={t("sharedEvidencePagination")}
          className="mt-4 flex items-center justify-between gap-3"
        >
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0 || query.isFetching}
            onClick={() => setOffset(Math.max(0, offset - 20))}
          >
            {t("sharedEvidencePrevious")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={offset + 20 >= evidence.total || query.isFetching}
            onClick={() => setOffset(offset + 20)}
          >
            {t("sharedEvidenceNext")}
          </Button>
        </nav>
      ) : null}
    </div>
  );
}
