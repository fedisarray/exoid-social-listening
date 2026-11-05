# Exoid Reviews

Private retail review analysis workspace. This milestone includes analyst authentication, live Google listing discovery through Apify, versioned saved analysis setup, and Dashboard scope exploration. The UI supports Italian (default) and English.

For production runtime, environment, authentication and worker setup, see [Hosting](docs/hosting.md).

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

Add `APIFY_TOKEN` to `.env.local` and restart Next.js. Discovery uses `kaix~google-maps-places-scraper` (`APIFY_DISCOVERY_ACTOR`); review collection uses `kaix~google-maps-reviews-scraper` (`APIFY_REVIEWS_ACTOR`). These adapters use the Kaix input and output formats.

Location autocomplete uses the public Photon/OpenStreetMap API, filtered by country. Enter a city and region or select a suggestion; search also works when suggestions are unavailable. Editing the location or country clears the selection. Suggestions are debounced and cached, require no API key, and show a retry option if unavailable. A direct Google Maps URL bypasses location entry. The public Photon service has usage limits and no availability guarantee.

Searches start only after an explicit submit. Each requests at most ten places and zero reviews, without slower detail-page scraping. Runs and normalized results are persisted per analyst. The search ID stays in the URL so reopening the link resumes polling; temporary status errors can be retried without launching another provider run. Actual results appear while the provider is running. Completed searches refresh metadata for matching saved properties. Cards show source-provided categories, Google rating/review count, website and phone when available; Google totals stay separate from collected review counts. Search name/location/country or paste a Google Maps URL, inspect identifying details, and confirm the listing. Unconfigured or failed providers display a useful error and never return demo data.

## Comparison AI

Each comparison has an **AI analysis** section for preparing the comparison’s existing review snapshots for chat, asking questions, and requesting sentiment/theme charts or a word cloud. Area charts show stacked monthly sentiment counts; radar charts compare places across positive, negative, mixed, and unclassified review counts. Ask for “an area chart of sentiment over time” or “a radar chart comparing places.” Both support review evidence drill-down and PNG downloads. Preparation copies all available comparison snapshot review rows into a versioned AI dataset; each chat request includes the active comparison period and only matching review text is sent to Anthropic. Claude citations link back to the imported review evidence.

Set `ANTHROPIC_API_KEY` and a random `COMPARISON_AI_WORKER_SECRET` of at least 32 characters in `.env.local`, then restart the app. The feature uses the direct Anthropic TypeScript SDK on the server. Keep these credentials private; no provider key is used in browser code.

An Apify token and a paid provider run are required to verify real search output. No token is bundled. Review acquisition, deterministic metrics, shared reviewers, findings, and Gamma PowerPoint generation are described in `docs/planning`.

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
