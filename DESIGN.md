---
name: Exoid Reviews
source: exoid-dashboard-v2
sourceBranch: refactor/design-system
sourceCommit: 1bc0d5ce7
mode: Operate
---

# Exoid Reviews design system

Reviews uses the effective Exoid Dashboard v2 design system from `refactor/design-system` at `1bc0d5ce7`. The source is the combination of `DashboardTheme`, `WorkspaceShell`, `WorkspacePanel`, `WorkspaceBackdrop`, and the shared UI primitives. Global legacy theme values in the source are overridden by the dashboard theme; use the effective values recorded here.

## Palette and typography

The application has one fixed light theme, including login, fallback screens, and portaled overlays. The root tokens in `app/globals.css` contain complete CSS colors; the source's HSL channels are wrapped in `hsl()` without changing their values.

| Token                       | Source value                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| Primary and ring            | `hsl(236 97% 65%)`                                                                              |
| Primary foreground          | `hsl(0 0% 98%)`                                                                                 |
| Foreground and surface text | `hsl(0 0% 9%)`                                                                                  |
| Background, card, popover   | `hsl(0 0% 100%)`                                                                                |
| Secondary, muted, accent    | `hsl(0 0% 96%)`                                                                                 |
| Muted foreground            | `hsl(0 0% 45%)`                                                                                 |
| Border and input            | `hsl(0 0% 90%)`                                                                                 |
| Sidebar background          | `hsl(230 24% 96%)`                                                                              |
| Sidebar accent              | `hsl(230 22% 92%)`                                                                              |
| Destructive                 | `hsl(350 100% 52%)`                                                                             |
| Chart series 1–5            | `hsl(12 76% 61%)`, `hsl(173 58% 39%)`, `hsl(197 37% 24%)`, `hsl(43 74% 66%)`, `hsl(27 87% 67%)` |

Use Inter as the shared interface font, loaded with `next/font` and self-hosted by Next.js. Use semibold headings, compact 14px interface text, and tabular numerals for measurements. Reviews retains a green `metric-positive` semantic token for positive review deltas. It does not change the source palette.

## Workspace and surfaces

- The canvas uses the exact radial white wash and `#eff0f6` → `#e5e8f1` gradient. The source's vector-fold backdrop sits behind both workspace surfaces at 60% opacity, with its 24-second drift and reduced-motion support.
- The desktop sidebar is 16rem wide with an inset layout. Its white surface is 35% opaque, blurred by 40px, with the source inset highlights and soft shadow. The Exoid watermark is 7% opaque. Navigation rests in slate-600; hover uses primary at 5%, and selection uses primary at 10% with violet text and semibold weight.
- The main workspace uses the same 10px corners as the sidebar (an explicit Reviews preference overriding the source’s 24px/32px frame), a white 70% border, white 35% surface, 40px blur, and the source workspace shadow. Content padding is 16px, 24px, then 32px. Its filter header stays within the scrolling workspace.
- Feature panels use `.exoid-panel`: white at 65%, a neutral border at 50%, 20px blur, and no shadow. Keep page identity and toolbars open; use panels for evidence, tables, forms, and grouped settings.
- Base radius is 10px; controls use 6px and feature panels/overlays 12px. Standard buttons and inputs are 32px high, small buttons 28px, and large buttons 36px. Coarse pointers receive at least 44px targets.
- Dialogs use white at 85%, neutral borders at 60%, 24px blur, and the source dialog shadow. Menus/selects/popovers use white at 85%, neutral borders at 50%, 24px blur, and the source menu shadow. Tooltips use white at 95% with 16px blur. Mobile sheets use white at 90% and 24px blur.
- Keep the theme at root scope so Radix portals inherit the same colors. Appearance overrides belong in the application theme. The official shadcn CLI owns primitives, using `new-york`, slate, and the existing Lucide icon library.

## Product and interaction rules

Italian remains the default and English remains supported. Keep the three global destinations: places, comparisons, and exports. The mobile sidebar opens as a sheet and closes after selecting a destination. Its account footer holds email, language, sign-out, and help. There is no light/dark switch.

Preserve URL-owned library views, search, pagination, exploration dates, roles, sections, and snapshots. Keep property details, monthly trends, rating distributions, comparison tables, shared-reviewer evidence, coverage diagnostics, and export settings intact. Tables scroll inside their own containers on narrow screens; page content must not overflow horizontally.

Keep real source identity, date scope, denominators, missing coverage, and collection states visible. Zero and unavailable values remain distinct. Do not invent metrics, provider results, or successful exports. Use native disclosures for optional explanations and accessible dialogs/popovers for focused tasks.

Save state remains pending until persistence succeeds. Failed saves retain the draft and restore confirmed cache. Download failures retain export settings. Preserve clear keyboard focus, responsive layouts down to 360px, focus restoration after dialogs, and reduced motion. The theme migration does not change authentication, repositories, database schemas, or metric calculations.
