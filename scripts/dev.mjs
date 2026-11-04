import { spawn } from "node:child_process";
const next = spawn("pnpm", ["exec", "next", "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
});
let ending = false;
function stop() {
  if (ending) return;
  ending = true;
  next.kill("SIGTERM");
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
next.on("exit", (code) => {
  stop();
  process.exitCode = code ?? 0;
});
