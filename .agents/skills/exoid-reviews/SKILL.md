---
name: exoid-reviews
description: Architecture and interaction rules for Exoid Reviews.
---
# Exoid Reviews

Adapted from the Exoid project/refactor skills. Apply AGENTS.md and docs/planning.
Feature ownership: auth, analyses, discovery. Platform: auth DAL, Supabase clients, i18n, query provider.
Each adapter parses input, creates trusted context, awaits its use case into a named result, validates output, and returns it. Expected business failures use a feature-local typed result; unexpected infrastructure and schema failures surface.
Use cases coordinate resource policy and repositories. Repositories use caller-bound database clients. Browser code never imports server infrastructure. Use generated Tables/Insert/Update types; schemas own transformed DTO types. Save analysis configurations transactionally as immutable versions.
Use shadcn/ui primitives generated with the official CLI. Use cn() for dynamic class names, semantic CSS tokens, and accessible native interactions. Keep responsive UI copy in both locale bundles.
Serialize saves per analysis. Optimistic cache values are pending, not persisted success. Roll back affected cache on failure and retain retryable form state. Discovery and future jobs display real durable states.
Use server queries for initial server rendering and TanStack hooks for active client state. React cache() memoizes only within a server request. Invalidate only affected feature keys. No unused provider adapters; Mastra/AI/reporting arrive with their flows.
