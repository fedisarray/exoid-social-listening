# Monitora: public product reconstruction

Research date: 2 November 2026  
Purpose: understand the publicly visible product and identify what we still need to learn before designing a similar service.

## Product at a glance

Monitora is presented as a web platform for analyzing online reviews of retail locations and comparing stores, brands, categories and competitors. Its focus is multi-location retail: shopping centres, retail parks, factory outlets, grocery, restaurants, fashion, furniture, electronics and related categories. UrbiStat positions the product alongside its geomarketing and retail research services.

The public material describes a combined software and service offering. The platform provides dashboards and analysis; UrbiStat also offers help configuring monitored locations and managing Google Business Profile listings and responses.

## Reconstructed customer workflow

This is a workflow inferred from public product copy, not an observed in-app walkthrough.

1. **Choose the locations to monitor.** A customer selects its points of interest (POIs), brands, categories and relevant comparison set. Customers can request analysis for locations outside the existing catalog.
2. **Resolve and normalize locations.** UrbiStat says it checks map placement and attributes such as location name, address and website. This suggests a curated POI catalog is central to the product.
3. **Load review history and keep it current.** For new locations, the site says historical reviews can be downloaded. Existing monitored locations are refreshed at least daily.
4. **Explore scores, trends and comments.** Users filter by time period, geography, sector, brand and, for some analyses, reviewer gender. They can compare locations or brands with benchmarks and competitors.
5. **Export or act on findings.** Analyses export to Excel. The review list lets users inspect individual reviews; owners can connect to the relevant management system to reply. Separately, UrbiStat offers listing cleanup and review-response services.

## Published analysis modules

| Module | Publicly described use |
|---|---|
| Scores | Track average rating and satisfied-customer share for a location, brand or sector. Compare against benchmarks and filter by time, geography and gender. |
| Positioning & Trends | Build line, area and scatter charts using platform analyses and filters. |
| Behavior | Track review edits, owner response behavior and an estimate of visits by hour and weekday. |
| Users | Analyze reviewer gender, the hours and days when reviews arrive, and reviewers shared between locations or competitors. |
| Matrix | Compare multiple locations or a chain's stores by rating, review volume, satisfied share and other measures. |
| Content & Sentiment | Classify positive and negative opinions by sector-specific topics, surface recurring topics and compare strengths and weaknesses across brands or locations. |
| Reviews List | Filter and inspect individual reviews; owners can move to the review management system to respond. |

## What the 2024 poster reveals about outputs

The [poster article](https://www.monitora.online/it/2024/12/16/poster-analisi-recensioni-dei-migliori-centri-commerciali-2024/) links to [side A](https://www.monitora.online/wp-content/uploads/2024/12/MONITORA_2024_SideA.pdf) and [side B](https://www.monitora.online/wp-content/uploads/2024/12/MONITORA_2024_SideB.pdf). Together, they show a concrete report format for shopping centres and factory outlets, covering 1 November 2022 through 31 October 2024.

The report combines ranked location tables, monthly review and rating trends, satisfied-user shares, reviewer breakdowns, response rates, sentiment by topic, and a positioning scatter plot. The scatter plot labels score and annual visits on its axes and review count as bubble size. The dashboard example shows per-location cards with rating trends and review indicators. Its legend defines “satisfied users” as reviewers giving 4 or 5 stars.

The poster names Google My Business and TripAdvisor as review sources. It reports 148,182 reviews for shopping centres and 88,233 for factory outlets in the analysis, with average scores of 4.40 and 4.38. The topic section shows positive-opinion shares of 88.7% and 88.6%. These are examples from this specific report, not necessarily current platform-wide totals.

The scale figures differ by source and context. The Italian marketing page shows 10 million reviews, 3.5 million users and 40,000 locations; the 2024 poster's product panel shows 42 million reviews, 12 million users and 75,000 stores. The newer [2026 poster](https://www.urbistat.com/poster-top-shopping-centres-retail-parks-and-factory-outlet-in-italy-2026/) shows 54 million reviews, 15 million users and 107,000 stores. The 2026 poster is the latest dated figure found, for a review analysis covering 1 November 2024 through 30 April 2026. The older overview appears stale; the exact definitions and counting rules still need confirmation.

## Services and sales model

The public site invites prospects to request a demo and says a person will help them use the platform. It does not publish pricing or a self-serve signup flow. The [services page](https://www.monitora.online/it/servizi/) describes Google Business Profile support: placing or correcting POIs, completing and standardizing listing attributes and content, replying to reviews, and managing instant messaging.

## Parent-company context

UrbiStat also sells uGeo, a geomarketing platform with retail location, catchment, competition, footfall and sales-prediction analysis. Its [2026 retail-center publication](https://www.urbistat.com/poster-top-shopping-centres-retail-parks-and-factory-outlet-in-italy-2026/) links to separate UrbiStat and Monitora posters. This suggests the products can complement one another around the same retail locations, but public pages do not confirm shared accounts, data pipelines or APIs. See [UrbiStat services research](urbistat-services-research.md) for the wider product and consulting portfolio.

## What remains unknown

The public site does not expose the authenticated product beyond a basic [login page](https://app.monitora.online/Site/Login.aspx). It provides no public user guide, API documentation or detailed methodology. We cannot confirm the following from public pages alone:

- The exact review-source coverage by category, ingestion method, source permissions, update guarantees or deduplication rules.
- The definitions and formulas behind scores, satisfaction, response rate, shared users, traffic estimates and rankings.
- How reviewer identity, gender and language are inferred, linked across locations, retained or protected.
- The sentiment model, topic taxonomy, language coverage, confidence scoring and human review process.
- The real dashboard navigation, user roles, tenant boundaries, alerts, saved views and export controls.
- Which reply actions happen in Monitora and which require an external Google or review-management system.
- Pricing, onboarding time, service levels and the boundary between software and managed services.

To understand the product fully, the highest-value next evidence would be a demo walkthrough or authorized test account, plus a sample export and the definitions for the poster's metrics. Until then, the workflow above should be treated as a public-evidence reconstruction.

## Sources

- [Monitora product overview, Italian](https://www.monitora.online/it/)
- [Monitora product overview, English](https://www.monitora.online/en/)
- [Monitora services](https://www.monitora.online/it/servizi/)
- [Monitora login](https://app.monitora.online/Site/Login.aspx)
- [Shopping-centre and outlet poster article](https://www.monitora.online/it/2024/12/16/poster-analisi-recensioni-dei-migliori-centri-commerciali-2024/)
- [2026 shopping-centre and outlet poster with Monitora sides](https://www.urbistat.com/poster-top-shopping-centres-retail-parks-and-factory-outlet-in-italy-2026/)
- [Monitora 2026 poster, side A](https://www.urbistat.com/wp-content/uploads/2026/06/MONITORA_2026_SideA.pdf)
- [Monitora 2026 poster, side B](https://www.urbistat.com/wp-content/uploads/2026/06/MONITORA_2026_SideB.pdf)
- [Review-response analysis: 2,034 restaurant anchor stores](https://www.monitora.online/it/2024/05/07/analisi-delle-recensioni-risposta-agli-utenti/)
- [Privacy notice](https://www.monitora.online/it/contatti/informativa-sulla-privacy/)
