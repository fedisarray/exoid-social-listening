# Exoid Reviews

Private retail review analysis workspace. This milestone includes analyst authentication, live Google listing discovery through Apify, versioned saved analysis setup, and Dashboard scope exploration. The UI supports Italian (default) and English.

## Local development

Requirements: Node 24+, pnpm 12.9.1, and a running Docker-compatible engine. Supabase CLI 3.0.0 is pinned in this project; no global CLI or hosted Supabase project is needed.

```sh
pnpm install --frozen-lockfile
pnpm db:start
pnpm exec supabase status -o json
```

The local project uses separate ports: API `55321`, PostgreSQL `55322`, and mail UI `55324`. `db:start` runs database, Auth, REST, gateway, mail, and Storage; unused analytics, realtime, edge runtime, and Studio services are excluded. Use `pnpm exec supabase start` to start the complete local stack if needed. Do not point this app at another project's local database.

Copy `.env.example` to `.env.local`. Fill `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` from **this project's** local CLI status. Keep `.env.local` private.

```sh
pnpm db:seed
pnpm db:types
pnpm dev
```

Open [localhost:3000](http://localhost:3000). Enter one of the provisioned email addresses printed by `db:seed`, select **Send sign-in code**, then open the [local email inbox](http://127.0.0.1:55324) and copy the six-digit code into the app. No password is required. Codes expire after ten minutes and can be used once. The login page includes a local inbox link in development. Use **Resend code** if needed, or **Change email** to correct the address. Accounts are provisioned through the local Auth Admin API; public signup is disabled. Seeding is idempotent and restricted to localhost. `pnpm db:reset` recreates **this project's** database from migrations and removes local accounts; run `db:seed` again afterwards. `pnpm db:stop` stops this project's stack.

The local OTP template is configured under `[auth.email.template.magic_link]` in `supabase/config.toml` and uses `{{ .Token }}`. After changing auth/email configuration, run `pnpm db:stop` followed by `pnpm db:start` to reload it without resetting the database. Hosted environments need the same OTP template and expiry configured separately. OTP requests set `shouldCreateUser: false`; an unprovisioned email cannot create an account.

## Listing discovery

Add `APIFY_TOKEN` to `.env.local` and restart Next.js. The default actor is `compass~crawler-google-places`, configurable through `APIFY_DISCOVERY_ACTOR`.

Searches start only after an explicit submit. Each requests at most ten places and zero reviews; runs and normalized results are persisted per analyst. Polling reads the provider's actual status. Search name/location/country or paste a Google Maps URL, inspect identifying details, and confirm the listing. Unconfigured or failed providers display a useful error and never return demo data.

An Apify token and a paid provider run are required to verify real search output. No token is bundled. Full review acquisition, deterministic metrics, shared reviewers, Mastra/AI, and Gamma PowerPoint generation remain later milestones in `docs/planning`.

## Architecture

`app/` contains thin routes and layouts. Feature screens and hooks call operation adapters; every action/query calls a use case. Use cases own authorization and business coordination; repositories exclusively own Supabase and outbound API access. Shared contracts live in `features/_shared` and platform code in `lib`.

Analysis configurations are saved transactionally through `save_analysis`, append immutable versions, and reject stale expected versions. Listing identity is checked against the analyst's discovered listings or their existing configuration. RLS isolates analyses, versions, and discovery runs by owner. UI writes use session-bound clients, never the admin key.

TanStack Query owns server state; React Hook Form owns drafts. Existing-analysis saves optimistically update cached details, remain pending until confirmed, roll back on failure, and retain the draft. Explicit conflict retry applies the retained draft against the latest server version. Dashboard filters live in the URL and never mutate the saved report scope.

UI primitives are installed with the official shadcn CLI. Compose them in feature components, use semantic tokens and `cn()` from `lib/utils`, and keep visible text in both locale bundles. Read `AGENTS.md` and `.agents/skills/exoid-reviews/SKILL.md` before changing code.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm build
```

`pnpm db:types` regenerates types from the running local schema and preserves the existing file if the CLI fails. Do not edit generated database types manually. `pnpm exec supabase db advisors --type security` checks the local schema. All package versions and the pnpm lockfile are pinned; refresh dependencies deliberately.

Reference research, PRDs, use cases, and domain diagrams are preserved under `references/` and `docs/planning/`. Confidential source attachments and all environment files are excluded from Git.
