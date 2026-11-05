import "server-only";
import type { OperationContext } from "@/lib/auth/dal";
import type { Json } from "@/lib/supabase/database.types";
import { generateComparisonAiAnswer } from "../repositories/anthropic";
import type { AskComparisonAiInput } from "../schemas/askComparisonAiInput";
import {
  createComparisonAiJob,
  findComparisonAiImport,
  insertComparisonAiMessage,
  listComparisonAiConversation,
  listComparisonAiReviews,
  wakeComparisonAiWorker,
} from "../repositories/comparisonAi";

import { getComparisonAiWorkbook } from "./getComparisonAiWorkbook";

function relevance(text: string, query: string): number {
  const terms = new Set(query.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []);
  const review = text.toLowerCase();
  return [...terms].reduce(
    (score, term) => score + (review.includes(term) ? 1 : 0),
    0,
  );
}

export async function askComparisonAi(
  ctx: OperationContext,
  input: AskComparisonAiInput,
  options: { onAnswer?: (answer: string) => void; signal?: AbortSignal } = {},
): Promise<{
  messageId: string;
  answer: string;
  citations: { reviewId: string; quote: string; sheet: string; row: number }[];
  jobId: string | null;
  workerStarted: boolean;
}> {
  const source = await findComparisonAiImport(
    ctx.db,
    ctx.organizationId,
    input.analysisId,
    input.importId,
  );
  if (!source) throw new Error("IMPORT_NOT_FOUND");
  if (source.import_kind !== "review_rows")
    throw new Error("REVIEW_ROWS_REQUIRED");
  if (!process.env.ANTHROPIC_API_KEY)
    throw new Error("ANTHROPIC_NOT_CONFIGURED");
  const rows = await listComparisonAiReviews(
    ctx.db,
    ctx.organizationId,
    input.importId,
    input.period,
  );
  const history = await listComparisonAiConversation(
    ctx.db,
    ctx.organizationId,
    input.importId,
    input.period,
  );
  options.signal?.throwIfAborted();
  await insertComparisonAiMessage(ctx.db, {
    organization_id: ctx.organizationId,
    analysis_id: input.analysisId,
    import_id: input.importId,
    role: "user",
    locale: input.locale,
    content: input.message,
    visualization: null,
    period_start: input.period.start,
    period_end: input.period.end,
  });
  const workbook = await getComparisonAiWorkbook(ctx, input);
  const evidence = rows
    .map((row) => ({ row, score: relevance(row.review_text, input.message) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.row.published_at ?? "").localeCompare(a.row.published_at ?? ""),
    )
    .slice(0, 40)
    .map(({ row }) => ({
      id: row.id,
      source: `${row.sheet_name}, row ${row.row_number}`,
      listing: row.listing_label,
      date: row.published_at,
      rating: row.rating,
      text: row.review_text.slice(0, 1200),
    }));
  const parsed = await generateComparisonAiAnswer(
    input,
    history,
    evidence,
    workbook,
    options,
  );
  options.signal?.throwIfAborted();
  if (
    parsed.visualizationType &&
    (!process.env.COMPARISON_AI_WORKER_SECRET ||
      process.env.COMPARISON_AI_WORKER_SECRET.length < 32)
  ) {
    throw new Error("COMPARISON_AI_WORKER_NOT_CONFIGURED");
  }
  const evidenceById = new Map(
    rows.map((row) => [
      row.id,
      {
        text: row.review_text,
        sheet: row.sheet_name,
        row: row.row_number,
      },
    ]),
  );
  for (const sheet of workbook.sheets.filter(
    (sheet) => sheet.kind === "reviews",
  )) {
    const id = sheet.columns.indexOf("revisionId");
    const text = sheet.columns.indexOf("text");
    const inPeriod = sheet.columns.indexOf("inSelectedPeriod");
    sheet.rows.forEach((row, index) => {
      if (row[inPeriod] === true)
        evidenceById.set(String(row[id]), {
          text: String(row[text]),
          sheet: sheet.name,
          row: index + 2,
        });
    });
  }
  const citations = parsed.citations.flatMap((citation) => {
    const row = evidenceById.get(citation.reviewId);
    if (!row || !row.text.includes(citation.quote)) return [];
    return [
      {
        reviewId: citation.reviewId,
        quote: citation.quote,
        sheet: row.sheet,
        row: row.row,
      },
    ];
  });
  const answer = parsed.answer.replace(
    /“([^”]+)”|"([^"]+)"/gu,
    (
      whole,
      curlyQuote: string | undefined,
      straightQuote: string | undefined,
    ) => {
      const quote = curlyQuote ?? straightQuote ?? "";
      return citations.some((citation) => citation.quote === quote)
        ? whole
        : "";
    },
  );
  const assistantMessageId = await insertComparisonAiMessage(ctx.db, {
    organization_id: ctx.organizationId,
    analysis_id: input.analysisId,
    import_id: input.importId,
    role: "assistant",
    content: answer,
    locale: input.locale,
    citations: citations as unknown as Exclude<Json, null>,
    visualization: null,
    period_start: input.period.start,
    period_end: input.period.end,
  });
  let jobId: string | null = null;
  let workerStarted = false;
  if (parsed.visualizationType) {
    const pendingMessage = await insertComparisonAiMessage(ctx.db, {
      organization_id: ctx.organizationId,
      analysis_id: input.analysisId,
      import_id: input.importId,
      role: "assistant",
      locale: input.locale,
      content:
        input.locale === "it"
          ? "Preparazione della visualizzazione…"
          : "Preparing the requested visualization…",
      citations: [],
      visualization: null,
      period_start: input.period.start,
      period_end: input.period.end,
    });
    jobId = await createComparisonAiJob(ctx, {
      analysisId: input.analysisId,
      importId: input.importId,
      messageId: pendingMessage,
      period: input.period,
      visualizationType: parsed.visualizationType,
      total: rows.length,
    });
    workerStarted = await wakeComparisonAiWorker();
  }
  return {
    messageId: assistantMessageId,
    answer,
    citations,
    jobId,
    workerStarted,
  };
}
