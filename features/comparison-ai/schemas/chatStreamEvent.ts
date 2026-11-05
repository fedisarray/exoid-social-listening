import { z } from "zod";
import { askComparisonAiOutputSchema } from "./askComparisonAiOutput";

export const chatStreamEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("answer"), answer: z.string().max(8000) }),
  z.object({
    type: z.literal("complete"),
    result: askComparisonAiOutputSchema,
  }),
  z.object({ type: z.literal("error"), error: z.string() }),
]);
export type ChatStreamEvent = z.infer<typeof chatStreamEventSchema>;
