# Milestone 01: working project foundation

Implemented 2 November 2026. The application now has a local Supabase CLI stack, private analyst login, Italian/English UI, listing discovery integration, versioned analysis setup, and Dashboard scope exploration.

## Delivered behavior

- shadcn/Radix primitives, semantic tokens, shared `cn()`, strict TypeScript, pinned pnpm dependencies, and adapted Exoid architecture rules.
- Authenticated list/new/setup/Dashboard routes. Every action/query delegates to a use case; repositories own database/provider requests.
- Local Auth accounts and owner RLS. Configuration saves append immutable versions transactionally and reject stale version numbers.
- Explicit Apify search with ten-result limit, direct Google listing URLs, durable run metadata, real status polling, canonical listing confirmation, and a missing-token error.
- Distinct primary/additional-own/competitor/anchor selections with labels and ordering. Quarter, trailing complete months, and custom periods.
- Optimistic existing-analysis saves, pending feedback, rollback, retained drafts, and explicit conflict retry. Dashboard URL filters do not mutate saved scope.

## Verification performed

- Dependency peer checks, frozen lockfile install, ESLint, TypeScript, production build, and local Supabase security advisors passed.
- Replayed the initial migration against the isolated project database.
- Independently checked quarter/date boundaries, leap-year behavior, complete-month windows, missing primary, duplicate listings, and invalid dates.
- Verified local login, disabled public signup, owner isolation for analyses/versions/discovery, denied revision updates, atomic persistence, and concurrent expected-version rejection.
- Exercised the real create use case using explicitly synthetic discovery fixtures and verified rejection of an unknown listing identity.
- Checked provider request/response mapping, URL mode, bounds and validation with controlled HTTP responses. These checks made no paid provider calls.
- Browser checks covered persisted labels/periods, failed-request rollback and retry, conflict preservation/retry, pending-save disabling, missing-provider errors, URL exploration filters, Italian/English, keyboard navigation, mobile overflow, visible role text, logout and unauthenticated redirects.
- Browser runtime and hydration checks passed after fixing optional URL validation and stable form label IDs.

All verification fixtures were removed by the clean migration replay. Development analyst accounts are provisioned without passwords. As of 3 November 2026, login uses email OTP captured in the local Supabase mail inbox at `http://127.0.0.1:55324`; codes expire in ten minutes and are single use. The password login operation and password environment setting have been removed.

## Remaining external validation

`APIFY_TOKEN` has not been supplied. Real provider search, ambiguous-result quality, and source listing identity fidelity remain unverified; add the token and run the acquisition pilot before claiming source coverage. There is no demo data fallback.

Review scraping, analytics, shared reviewers, findings, Mastra, OpenRouter and Gamma exports remain subsequent milestones. The Dashboard explicitly shows that reviews have not yet been collected.
