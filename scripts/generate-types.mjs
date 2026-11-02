import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const output = execFileSync(
  "pnpm",
  ["exec", "supabase", "gen", "types", "--schema", "public"],
  { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
);
if (!output.includes("export type Database"))
  throw new Error(
    "CLI did not return TypeScript; existing types were preserved.",
  );
writeFileSync("lib/supabase/database.types.ts", output);
