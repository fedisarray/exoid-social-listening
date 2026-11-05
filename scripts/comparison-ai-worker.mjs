import { loadEnvFile } from "node:process";
import { existsSync } from "node:fs";
import { z } from "zod";
if (existsSync(".env.local")) loadEnvFile(".env.local");
const secret = process.env.COMPARISON_AI_WORKER_SECRET;
if (!secret || secret.length < 32) process.exit(0);
const origin = process.env.APP_INTERNAL_URL || "http://127.0.0.1:3000";
const outputSchema = z.object({
  worked: z.boolean(),
  nextAttemptAt: z.iso.datetime({ offset: true }).nullable(),
});
let stopped = false;
let timer;
let failures = 0;
async function tick() {
  if (stopped) return;
  let delay = null;
  try {
    const response = await fetch(`${origin}/api/internal/comparison-ai`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(55_000),
    });
    if (!response.ok) throw new Error(`Worker HTTP ${response.status}`);
    const result = outputSchema.parse(await response.json());
    failures = 0;
    if (result.nextAttemptAt)
      delay = Math.max(100, Date.parse(result.nextAttemptAt) - Date.now());
  } catch (error) {
    failures++;
    if (failures === 1)
      console.error(
        error instanceof Error ? error.message : "AI worker unavailable",
      );
    delay = Math.min(60_000, 5000 * 2 ** Math.min(failures - 1, 4));
  }
  if (!stopped && delay !== null) timer = setTimeout(tick, delay);
}
function stop() {
  stopped = true;
  clearTimeout(timer);
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
void tick();
