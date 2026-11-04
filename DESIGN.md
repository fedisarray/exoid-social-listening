---
name: Exoid Reviews
description: An approachable workspace for places, review evidence, and comparisons.
colors:
  primary: "#2459d3"
  foreground: "#18263e"
  surface: "#ffffff"
  canvas: "#f5f7fb"
  muted: "#edf1f7"
  muted-foreground: "#5b6b83"
  border: "#dce3ee"
  input: "#8492a8"
  sidebar: "#15243c"
  chart-reviews: "#5278d5"
  chart-rating: "#0f766e"
  sidebar-accent: "#29436b"
  sidebar-foreground: "#edf3ff"
typography:
  headline:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
spacing:
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  7: "1.75rem"
  8: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 0.625rem"
  button-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "2rem"
  input:
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "2rem"
  navigation-active:
    backgroundColor: "{colors.sidebar-accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 0.75rem"
  badge-secondary:
    backgroundColor: "{colors.muted}"
    textColor: "#30476a"
    height: "1.25rem"
  place-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
---
# Design System: Exoid Reviews

## Overview

An analyst workspace made approachable for ordinary users: find and save a place, collect its reviews, then compare saved places. Clear group boundaries and explicit reporting dates keep the evidence understandable.

The incumbent ink and blue palette, system typography, quiet rounded controls, and restrained surfaces support a practical working tool. Progressive disclosure keeps optional setup available without crowding the main task.

**Key Characteristics:**
- Plain language in Italian by default, with English supported.
- A clear next action and optional detail revealed on demand.
- Visible evidence scope, collection status, and honest missing-data states.

## Colors

**Cobalt & Slate** is the active theme. Cobalt identifies primary actions and focus; deep navy anchors navigation, with slate text and cool pale surfaces. White cards and popovers sit above the soft canvas. Review-count bars use cornflower blue and average-rating lines use teal; labels, bars, and lines keep the series distinguishable without relying on color alone. Matching dark tokens use layered navy surfaces and lighter blue and teal accents. The frontmatter records the active light-theme palette from `app/globals.css`.

### Primary

- **Cobalt** (`primary`): primary buttons, links, selection, and focus accents.

### Neutral

- **Ink** (`foreground`): main text; a deeper navy (`sidebar`) anchors desktop navigation.
- **White Surface** (`surface`): cards and configuration surfaces.
- **Cool Canvas** (`canvas`): the workspace background.
- **Quiet Surface** (`muted`): secondary controls and subdued backgrounds.
- **Muted Ink** (`muted-foreground`): secondary explanations and metadata, with sufficient visual weight to remain readable.
- **Divider** (`border`) and **Control Edge** (`input`): distinct surface and input boundaries.
- **Navigation Highlight** (`sidebar-accent`) and **Navigation Text** (`sidebar-foreground`): selected and resting navigation states.

## Typography

Use the system sans stack for page titles, body, and controls. Page titles use the headline token; section headings use a semibold sans treatment. Body explanations remain calm and readable, with smaller text for labels and supporting metadata. Data uses tabular numbers.

**The Clear Title Rule.** Page titles use system sans at the headline token; do not use Georgia.

## Layout

Desktop uses a narrow ink navigation rail (224px) at the large breakpoint, with wide content aligned left. The workspace filter header stays sticky at the viewport top and participates in document flow. On desktop it starts after the 224px navigation rail. Its controls wrap on narrow screens. Mobile places compact navigation below the header; section links scroll horizontally. The localized sidebar theme switch uses the existing shadcn Button with Lucide icons. Theme state follows the system initially and persists an explicit light/dark choice through next-themes. The navigation places **My places** before **Comparisons**. Keep one primary action per form and arrange fields in task order.

At desktop widths, use 24px workspace padding and a 1536px content cap. Saved-place cards use 16px internal padding with 16px grid gaps; retain the roomier existing phone spacing.

The places library uses concise evidence cards with a direct collect-reviews or view-reviews action. The optional three-step guide describes finding a place, collecting reviews, and comparing places; it opens from the sidebar help action. Add place is a primary header action that opens a shadcn dialog with a wider responsive search form pinned above independently scrollable results. A saved discovery in the URL opens the dialog on arrival; closing and reopening preserves the search draft. Search uses full localized country names; direct Maps URL entry is optional and disclosed separately.

Saved places use compact full-width rows on wide desktop screens: photo and identity on the left, review metrics and comment counts in the middle, and the monthly chart on the right. Keep the chart column for uncollected places with an explicit empty-state message. Listing images are 112px on wide desktop screens and 96px below that. Collection dates and actions sit in a shared row footer. Below the wide breakpoint, stack these sections in the same order. Places with saved reviews appear first, retaining their relative order. Keep the shared metric-scope explanation above the list rather than repeating it in each row.

The library view selector offers Table, Cards, Rows, and Small rows, with Table as the default and `view` in the URL preserving the selection alongside search. Cards use two columns on wide screens and stack their chart below the metrics. Small rows hide charts and secondary collection dates, use a 48px image, and align identity, key metrics, comment counts, and actions in one desktop row. Cards and Rows retain the larger listing images and empty chart panels.

Comparison setup uses one column capped at 48rem, ordered name → places → dates. Configuration retains a persistent save bar. New comparisons open their dashboard only after persistence succeeds. The property workspace places its collapsed date controls before the content in the document order, and collapses scope details while retaining coverage warnings.

## Elevation & Depth

Depth comes primarily from pale canvas, white surfaces, quiet borders, and the dark navigation rail. Preserve this restrained hierarchy; cards do not need decorative elevation. Sticky save controls remain visually distinct through their surface and border.

## Shapes

Quiet rounded controls follow the existing shadcn primitives. The base corner radius is 0.625rem; feature surfaces commonly use the larger rounded treatment documented in the tokens. Status badges use a pill shape. Do not alter shared primitives incidentally to style an individual feature.

## Components

Property detail pages use a cover header with the real listing photo, name, address, contact links, collection action, and local section navigation. The photo sits beside the identity on desktop and above it on mobile; only the cover image loads eagerly. Review cards below it omit repeated property identity. Detailed review cards place their metrics in a full-width first row, followed by the rating breakdown and monthly trend chart side by side on wide screens and stacked on phones. Detailed rating summaries include a 5-to-1-star breakdown with counts and percentages based on rated reviews in the selected period; empty periods show an explicit empty state.

Property date filters sit in the sticky workspace header. Keep the localized selected dates visible; open editing controls in a keyboard-accessible popover that scrolls within the available screen space and returns focus to its trigger when closed.

- **Navigation:** separate places from saved comparisons. Property workspaces expose Overview, Reviews, and Trends. The header’s Collect reviews action opens a dialog containing date range, review limit, collection progress, and history; there is no separate property Collection section. Comparison workspaces expose their sections only in the page tabs; the sidebar holds the two global destinations without repeating comparison sections. Shared reviewers belong to comparisons.
- **Workspace help:** place “How it works” at the bottom of the sidebar, above the private-workspace note. Open the three-step guide in a dismissible, keyboard-accessible popover; on mobile, keep the trigger below the compact navigation and fit the popup within the viewport.
- **Place evidence card:** present source identity, available collection metrics, and the relevant next action. Distinguish Google Maps totals from collected reviews and retain the rated-review denominator. Missing photos and unavailable metrics remain explicit. Saved places show counts with and without written comments from the same saved review set. Cards and Rows combine monthly saved review-count bars and an average-rating line, with separate count and 1–5 rating scales, visible series labels, missing ratings left as gaps, and monthly counts available in the tooltip; Small rows omit the chart.
- **Comparison list and dashboard:** use an open identity header with compact saved-date/version metadata and sync/setup actions. Place one horizontal section navigation above a shared exploration toolbar for dates and roles. Avoid repeating the selected dates in the content. Align table numbers to the right and identity to the left, retaining roles and rating denominators. Trend panels use a responsive grid on wide screens and stack on phones. Preserve evidence scope and visible coverage status; optional detail must not obscure the next task.
- **Property trends:** use a compact property identity header, a prominent monthly review/rating chart with explicit period and source, and an expandable monthly data table. Put full calendar-year history beside a trailing-12-complete-month summary, followed by selected-period changes. Keep coverage warnings visible, hide inapplicable competitor indicators, and retain missing values as unavailable. Stack panels on narrow screens.
- **Shared reviewers:** use responsive comparison rows with property identity, shared-author count, two named percentage bars on a common 0–100 scale, and subgroup ratings. Each bar shows its own identified-reviewer denominator. Preserve zero and unavailable values distinctly. Keep reviewer-ID coverage and calculation notes in a disclosure below the comparisons.
- **Exports:** a third global sidebar destination opens `/exports`. Keep configuration on the page: comparison, dates/dataset, included places, selected sheets, history depth, charts and export language. Use a two-column form with a sticky download summary on wide screens and stack it on phones. Default to the seven-sheet workbook, keep failed-download drafts, and show coverage requirements before downloading. Comparison dashboards link here with their current date and snapshot scope.
- **Disclosures:** use native, keyboard-accessible details/summary for optional guidance and setup. Keep important failures and coverage warnings visible when secondary details are collapsed.
- **Forms and saves:** use localized plain language and explicit pending/success/failure states. Failed saves retain the draft and restore confirmed cache. URL state owns exploration filters, including section, period, role, and snapshot selection; TanStack Query owns server state and RHF owns drafts.
- **Interaction:** preserve visible focus and semantic controls. Coarse pointers receive at least 44px control height; reduced-motion preferences suppress animation and transition duration.

## Do's and Don'ts

### Do

- Use semantic theme tokens and compose the existing shadcn primitives.
- Keep dates, source identity, and coverage understandable alongside the evidence.
- Preserve drafts and distinguish unsaved, saving, saved, and conflict states.
- Keep layouts usable at 360px, keyboard focus visible, and touch controls comfortable.

### Don't

- Do not show invented charts, provider results, metrics, or export completion.
- Do not replace the ink and blue identity or reintroduce serif page titles.
- Do not expose optional setup ahead of the main user task.

### Workspace chrome update

The sidebar owns email, theme, language, sign-out, and help controls. The sticky workspace header contains the active page filters: date and role exploration on comparison dashboards, date exploration on property dashboards, and search in the place/comparison libraries. Filters appear once and retain URL state. Header controls wrap on narrow screens; the header participates in document flow so wrapped rows never overlap content. Pages without filters omit the header.
