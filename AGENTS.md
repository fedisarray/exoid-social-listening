# Exoid Reviews rules

Read `.agents/skills/exoid-reviews/SKILL.md` before coding. Existing planning documents in docs/planning and references define product intent.
- Next.js 16, strict TypeScript, pnpm. Pin dependencies and retain pnpm-lock.yaml.
- Thin routes → feature screen/hook → action/query adapter → use case → domain/repository.
- Every action/query calls one use case. Repositories exclusively own database and outbound API access. Pure domain code has no React/database dependencies.
- One operation per action/query/use-case/schema file. Group repositories by resource. No compatibility barrels or generic service layer.
- Trusted identity/context comes from lib/auth/dal.ts. Never accept actor IDs or privileged clients from inputs. Enforce resource access and RLS.
- Runtime Zod inputs/outputs, generated database types, explicit exported operation return types. Resolve clients/async values into named locals before passing them.
- shadcn CLI owns components/ui primitives. Compose feature UI; use semantic theme tokens, variants, Lucide, and cn() from lib/utils.ts. Avoid incidental primitive edits.
- Italian default, English supported. Localize all visible application text.
- TanStack Query owns server state, RHF owns drafts, URL owns exploration filters. No Zustand or duplicate cache.
- Optimistic saves stay pending until persistence succeeds; restore confirmed cache on failure and retain draft. Never invent provider results, metrics, or export completion.
- Verify lint, typecheck, build and affected behavior. Do not add test suites unless asked; use focused disposable verification scripts.
- Never commit .env files, credentials, local database files, or confidential attachments.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
