import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/dal";
import { askComparisonAi } from "@/features/comparison-ai/use-cases/askComparisonAi";
import { askComparisonAiInputSchema } from "@/features/comparison-ai/schemas/askComparisonAiInput";
import {
  chatStreamEventSchema,
  type ChatStreamEvent,
} from "@/features/comparison-ai/schemas/chatStreamEvent";
import { comparisonAiBusinessError } from "@/features/comparison-ai/schemas/businessError";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/analyses/[id]/ai/chat">,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json();
  const input = askComparisonAiInputSchema.parse({ ...body, analysisId: id });
  const ctx = await requireUser();
  const cancellation = new AbortController();
  const signal = AbortSignal.any([request.signal, cancellation.signal]);
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: ChatStreamEvent) => {
        if (signal.aborted) return;
        const parsed = chatStreamEventSchema.parse(event);
        controller.enqueue(encoder.encode(`${JSON.stringify(parsed)}\n`));
      };
      try {
        const result = await askComparisonAi(ctx, input, {
          signal,
          onAnswer: (answer) => emit({ type: "answer", answer }),
        });
        emit({ type: "complete", result });
      } catch (error) {
        if (!signal.aborted) {
          const code = comparisonAiBusinessError(error);
          if (!code) console.error("Comparison AI stream failed", error);
          emit({ type: "error", error: code ?? "REQUEST_FAILED" });
        }
      } finally {
        if (!cancellation.signal.aborted) controller.close();
      }
    },
    cancel() {
      cancellation.abort();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
