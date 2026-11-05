# Hosting Exoid Reviews

## Runtime

Use a persistent Node.js 24+ server with pnpm 12.9.1. Run commands from the repository root. The application needs server rendering, server actions, streaming responses and background child processes; static hosting is insufficient. The current worker launcher requires a host that allows detached Node processes to continue after a request. A serverless deployment needs a separate durable job runner before collection, AI preparation and report generation can be relied on.

Keep `scripts/`, `public/`, `.next/`, `package.json`, the lockfile and installed production dependencies in the deployed release. Deploying only `.next/standalone` is not configured or supported by this setup.

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

Terminate HTTPS at the hosting platform or reverse proxy. Forward streaming responses without buffering and allow sufficient request duration for AI responses and internal processing. Keep the process supervised and set its working directory to the release root. `next start` honors `PORT` (default `3000`).

## Environment

Inject production environment variables through the host's secret configuration. `.env.example` lists the names; do not deploy local `.env` or `.env.local` files. Set the two `NEXT_PUBLIC_` variables before building, because their values can be embedded in the build. Rebuild when changing them.

| Variable                               | Production value                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | HTTPS URL of the production Supabase project                                                      |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key from that same project                                                            |
| `SUPABASE_SECRET_KEY`                  | Server-only secret key from that project                                                          |
| `APIFY_TOKEN`                          | Server-only token for discovery and collection                                                    |
| `APIFY_DISCOVERY_ACTOR`                | `kaix~google-maps-places-scraper`                                                                 |
| `APIFY_REVIEWS_ACTOR`                  | `kaix~google-maps-reviews-scraper`                                                                |
| `COLLECTION_WORKER_SECRET`             | Random server-only secret, at least 32 characters                                                 |
| `REPORT_WORKER_SECRET`                 | Separate random server-only secret, at least 32 characters                                        |
| `COMPARISON_AI_WORKER_SECRET`          | Separate random server-only secret, at least 32 characters                                        |
| `APP_INTERNAL_URL`                     | Address workers can reach, e.g. `http://127.0.0.1:3000` on the same server; match the actual port |
| `REPORT_GENERATION_API_KEY`            | Server-only presentation provider key, required for PowerPoint generation                         |
| `ANTHROPIC_API_KEY`                    | Server-only Anthropic key, required for comparison AI                                             |

Never prefix server secrets with `NEXT_PUBLIC_`. Keep preview deployments on a separate database and provider configuration from production.

## Database and sign-in

Apply all checked-in `supabase/migrations/` to the intended production project before deploying the matching application. Use a reviewed migration deployment; do not run `db:reset` or the localhost-only analyst seed against production. See the [Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod) for hosting-side configuration and [CLI v3 changes](https://supabase.com/changelog/supabase-cli-v3) before automating migration commands.

Configure the production Auth site URL with the final HTTPS origin. Keep public signup disabled, configure a production SMTP provider, and use the existing six-digit OTP email template (`{{ .Token }}`) with the ten-minute expiry used by this app. Local mail configuration is not automatically copied to a hosted project. Verify email delivery and sign-in before inviting analysts.

Provision analyst Auth accounts and organization memberships administratively. A valid account without membership reaches the organization-required page. The existing `provision_organization(p_user_id, p_name)` operation creates an organization and its initial owner; see [organization provisioning](implementation/organization-foundation.md). Configure an organization's report template before verifying PowerPoint generation.

## Background processing

Collection, report generation and AI preparation launch the corresponding script when work is explicitly requested. Workers use bearer authentication against `/api/internal/collections`, `/api/internal/reports` and `/api/internal/comparison-ai`. Keep each secret identical in the application and its workers. These endpoints must be reachable by workers through the configured internal URL, including when a reverse proxy protects the public site.

Workers exit when their queue is empty. After a deployment or server restart, run these once after the application is accepting requests to resume pending jobs:

```sh
node scripts/collection-worker.mjs
node scripts/report-worker.mjs
node scripts/comparison-ai-worker.mjs
```

Launch each independently as a background task in the host's post-start hook, with the same injected environment and working directory. Do not configure an unconditional restart loop for an idle worker. Interrupted report starts can require explicit recovery rather than an automatic paid retry; see [report processing](implementation/powerpoint-reports.md).

## Branding and release verification

Next.js serves the existing Exoid mark as `/favicon.ico`, `/icon.svg` and `/apple-icon.png`. The web manifest includes 192px and 512px home-screen icons. This supplies branding; there is no offline mode. Page metadata uses Italian by default and English for the English locale. `robots.txt`, page metadata and `X-Robots-Tag` exclude this private workspace from search indexing; authorization remains responsible for protecting its data.

Before opening access, check HTTPS, both locale descriptions, browser icons and sign-in/sign-out. With a provisioned organization member, verify saved properties/comparisons, an explicitly authorized collection, AI preparation/chat, and report download using the intended production providers. Confirm another organization's resources cannot be accessed. Provider-backed checks incur actual usage and have not been performed as part of the local hosting preparation.
