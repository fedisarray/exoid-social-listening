# POC technology choices

Recorded: 2 November 2026. User selected Next.js 16, Mastra with OpenRouter and GPT-6 Luna, Gamma API for PowerPoint generation, Apify for scraping, and local Supabase for the backend data services. This is a planning decision; implementation has not started.

## Responsibilities

- **Next.js 16:** Application interface and server endpoints for analyst setup, search, analysis, commentary review and report downloads. Use TypeScript as the proposed implementation language; select and pin an appropriate patched 16.x release when implementation begins.
- **OpenRouter and GPT-6 Luna:** Model access for Mastra-powered theme/sentiment analysis and draft commentary. OpenRouter lists the model as `openai/gpt-6-luna`. Keep the model ID configurable and credentials server-side. Evaluate output grounding and structured responses on representative reviews before relying on it. Official numeric metrics remain deterministic application calculations.
- **Apify:** Google listing discovery and review acquisition behind a provider adapter. Normalize and deduplicate records in application storage; retain collection diagnostics and snapshot versions. For the Google baseline explicitly set `reviewsOrigin` to `google` because the documented default is `all`. Reviewer ID availability depends on the personal-data setting and actual returned records; request only fields required for the workflow and confirm retention and access controls before deployment.
- **Application code and database:** Persist listings, analysis configuration, normalized reviews, collection runs, calculated metrics, commentary and immutable report versions. Compute ratings, satisfaction, trends and reviewer overlap deterministically.
- **Local Supabase:** Use PostgreSQL for application records and report/dataset version metadata, Auth for analyst sign-in, and private Storage buckets for generated PowerPoint files. Run the local stack through the Supabase CLI and a supported container runtime. Track schema changes and seed data in the project. Enable RLS and policies matching analyst access; retain server-only privileged credentials. Durable Mastra state needs explicit persistence configuration; application data in Supabase does not automatically persist workflow state.
- **Mastra:** Orchestrate collection, normalization, metric calculation, AI commentary and reporting steps. Persist workflow state where appropriate. Pause for analyst review before sending approved report content to Gamma. Keep analyst edits in application storage.
- **Gamma API:** Generate a presentation using a reusable template and export PPTX. Supply calculated figures, explicit periods and approved commentary. Download and retain the exported artifact with its report version.

## Proposed flow

Property confirmation → Apify acquisition → normalized storage → deterministic metrics → Mastra AI commentary → analyst review → Gamma template generation → PPTX checks → saved export.

## Feasibility checks

1. Run an acquisition pilot for Fiumara, one competitor and one anchor. Measure history depth, missing reviewer IDs, duplicate behavior, runtime and cost. A successful Actor run does not establish complete history.
2. Generate a small Gamma deck from controlled metrics and reviewed text. Confirm numeric fidelity, periods, layout, text editability and whether charts export as native PowerPoint charts with embedded data. PPTX export alone does not prove the chart requirement.

Gamma documents that chart generation is non-deterministic and exposes no dedicated chart-type, style or data-formatting parameters. Its template endpoint is recommended for greater consistency. If native editable charts cannot be delivered reliably, use a direct PPTX chart-generation or post-processing component for those slides, or explicitly revise the proposed chart baseline with the user. Do not replace charts with images while claiming compliance.

## Documentation checked

- [Mastra workflows](https://mastra.ai/docs/workflows/overview)
- [Gamma generation and export](https://developers.gamma.app/guides)
- [Gamma chart generation constraints](https://developers.gamma.app/guides/charts-and-structured-content)
- [Apify Google Maps Reviews Scraper input settings](https://apify.com/compass/google-maps-reviews-scraper/input-schema)
- [Supabase local development](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Next.js 16](https://nextjs.org/blog/next-16)
- [GPT-6 Luna on OpenRouter](https://openrouter.ai/openai/gpt-6-luna)

Eventual production deployment remains undecided. Supabase runs locally for the POC; Apify, Gamma and OpenRouter still require external network calls. Local Supabase does not make the complete processing pipeline local. API credentials, pilot spending limits and actual acquisition/PowerPoint validation remain outstanding.
