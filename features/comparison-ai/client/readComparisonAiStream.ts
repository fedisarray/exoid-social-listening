import { chatStreamEventSchema } from "../schemas/chatStreamEvent";
import type { AskComparisonAiOutput } from "../schemas/askComparisonAiOutput";

export async function readComparisonAiStream(
  body: ReadableStream<Uint8Array>,
  onAnswer: (answer: string) => void,
): Promise<AskComparisonAiOutput> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split("\n");
      buffer = done ? "" : (lines.pop() ?? "");
      if (buffer.length > 65536) throw new Error("REQUEST_FAILED");
      for (const line of lines) {
        if (line.length > 65536) throw new Error("REQUEST_FAILED");
        if (!line.trim()) continue;
        const event = chatStreamEventSchema.parse(JSON.parse(line));
        if (event.type === "error") throw new Error(event.error);
        if (event.type === "complete") return event.result;
        onAnswer(event.answer);
      }
      if (done) throw new Error("REQUEST_FAILED");
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
