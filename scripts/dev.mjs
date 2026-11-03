import { spawn } from "node:child_process";
const next = spawn("pnpm", ["exec", "next", "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
});
const worker = spawn(process.execPath, ["scripts/collection-worker.mjs"], {
  stdio: "inherit",
});
let ending = false;
function stop() {
  if (ending) return;
  ending = true;
  worker.kill("SIGTERM");
  next.kill("SIGTERM");
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
next.on("exit", (code) => {
  stop();
  process.exitCode = code ?? 0;
});
