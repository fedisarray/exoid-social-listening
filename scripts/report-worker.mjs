import { loadEnvFile } from "node:process";
import { existsSync } from "node:fs";
import { z } from "zod";
if (existsSync(".env.local")) loadEnvFile(".env.local");
const secret = process.env.REPORT_WORKER_SECRET;
if (!secret || secret.length < 32) {
  console.error(
    "Report worker disabled: configure REPORT_WORKER_SECRET (32+ characters).",
  );
  process.exit(0);
}
const origin = process.env.APP_INTERNAL_URL || "http://127.0.0.1:3000";
const resultSchema = z.object({
  worked: z.boolean(),
  nextAttemptAt: z.iso.datetime({ offset: true }).nullable(),
});
let stopping = false;
let processing = false;
let wakePending = false;
let processTimer;
let failures = 0;

async function request(path) {
  const response = await fetch(`${origin}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`Worker HTTP ${response.status}`);
  return response.json();
}

function wake(delay = 0) {
  if (stopping) return;
  clearTimeout(processTimer);
  if (processing) {
    wakePending = true;
    return;
  }
  processTimer = setTimeout(processQueue, delay);
}

async function processQueue() {
  if (stopping) return;
  processing = true;
  wakePending = false;
  let delay = null;
  try {
    const result = resultSchema.parse(await request("/api/internal/reports"));
    failures = 0;
    if (result.nextAttemptAt)
      delay = Math.max(100, Date.parse(result.nextAttemptAt) - Date.now());
  } catch (error) {
    failures++;
    if (failures === 1)
      console.error(
        error instanceof Error ? error.message : "Worker unavailable",
      );
    delay = Math.min(60_000, 5_000 * 2 ** Math.min(failures - 1, 4));
  } finally {
    processing = false;
    if (wakePending) wake();
    else if (delay !== null) wake(delay);
  }
}

function stop() {
  stopping = true;
  clearTimeout(processTimer);
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
// Invoked only by an explicit report generation or resume request; exits when the queue is empty.
wake();
