# Core app scope

User highlighted two primary application areas: Analysis setup and Dashboard. Treat these as navigation and layout priorities. The PRD's evidence inspection, text analysis, reviewed commentary and PowerPoint requirements remain in scope; their deferral has not been agreed.

## Analysis setup

- Name the analysis.
- Search and confirm Google listings within setup, or resolve a direct listing URL.
- Select the primary own property and optional additional own properties, keeping their series separate.
- Manually select competitors and tenant stores (anchors).
- Choose a calendar quarter, last 12 complete months or custom dates and display explicit boundaries.
- Save configuration, labels, ordering and listing relationships; reopen and edit a saved analysis.
- Start collection and analysis from the saved configuration.

For initial validation use Fiumara Shopping, one competitor and one anchor. The configuration structure should support additional own properties and variable comparison groups.

## Dashboard

- Show the analysis name, property group, selected dates, source and last successful refresh.
- Show queued, running, completed, partial and failed collection states and coverage limitations.
- Compare review counts, average scores and the percentage of four- and five-star reviews.
- Show monthly trends and clearly labelled historical comparisons where history is available.
- Include full calendar-year history and the selected quarter against the same quarter in prior years, where data is available. Do not equate a trailing 12-month window with a calendar year.
- Compare own properties, manually selected competitors and anchors.
- Show shared-reviewer counts, directional shares, subgroup scores and reviewer-ID coverage for the primary property against competitors.
- Show sample sizes, unavailable values and incomplete periods explicitly.
- Let the analyst reopen setup and refresh collection without duplicating reviews.

The Dashboard can serve as the analysis workspace with tabs or sections for overview, competitors, anchors, shared reviewers, review evidence, themes/sentiment, findings and report preview. This is a proposed interface arrangement; the PRD defines behavior rather than a required screen count.

FR07 requires searchable individual reviews and filters by property, date, rating, original language, theme and sentiment where available. Findings must link to supporting metrics or reviews, be editable and reviewable, and preserve manual edits during regeneration. Exploratory filters must not silently change an existing report.

FR08 requires PPTX generation from frozen data and commentary, following the eleven-slide content baseline with variable-length comparisons. Provide preview/download, distinguish draft and partial exports, and preserve previous versions. Editable text and native charts with embedded data are the proposed output baseline; Gamma's ability to meet this remains to be validated.

## Supporting backend

Next.js 16 application; local Supabase database and analyst authentication; Apify collection adapter; durable collection/job tracking; deterministic metric functions; saved configurations and dataset snapshots. Mastra may coordinate workflow steps; its persistence must be explicitly configured.

## Delivery sequencing

The PRD proposes acquisition validation first, then storage, configurations and deterministic metrics, followed by exploration, shared reviewers, evidence-linked commentary and PowerPoint generation. A numeric-dashboard-only milestone is possible but is not the complete PRD or a confirmed scope reduction. Mastra, OpenRouter/GPT-6 Luna and Gamma remain selected for the complete POC workflow.

## Planning baseline

The source PRD remains authoritative for metric definitions, shared-reviewer semantics, data integrity and access requirements. This document records the user's selected first implementation scope. Implementation has not started.
