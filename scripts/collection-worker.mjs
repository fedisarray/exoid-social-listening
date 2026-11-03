import { loadEnvFile } from "node:process";
import { existsSync } from "node:fs";
if (existsSync(".env.local")) loadEnvFile(".env.local");
const secret = process.env.COLLECTION_WORKER_SECRET;
if (!secret || secret.length < 32) {
  console.error(
    "Collection worker disabled: configure COLLECTION_WORKER_SECRET (32+ characters).",
  );
  process.exit(0);
}
const origin = process.env.APP_INTERNAL_URL || "http://127.0.0.1:3000";
let stopping = false;
let lastError = "";
process.on("SIGTERM", () => {
  stopping = true;
});
process.on("SIGINT", () => {
  stopping = true;
});
console.log("Review collection worker ready.");
while (!stopping) {
  try {
    const response = await fetch(`${origin}/api/internal/collections`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) throw new Error(`Worker HTTP ${response.status}`);
    lastError = "";
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Worker unavailable";
    if (message !== lastError) {
      console.error(message);
      lastError = message;
    }
  }
  if (!stopping) await new Promise((resolve) => setTimeout(resolve, 2000));
}
