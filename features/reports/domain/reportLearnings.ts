import type { Period } from "@/features/_shared/schemas/period";
import { resolvePeriod } from "@/features/_shared/domain/period";
import { windowCovered } from "@/features/reviews/domain/reviewCoverage";
import type { FrozenReportData } from "../schemas/frozenReportData";
export function reportLearnings(
  data: FrozenReportData,
  period: Period,
  locale: "it" | "en",
): { bullets: string[]; actions: string[] } {
  const it = locale === "it";
  const ids = new Set(
    data.exportOptions?.listingIds ??
      data.coverage.map((place) => place.listingId),
  );
  const places = data.coverage.filter((place) => ids.has(place.listingId));
  const fmt = (n: number | null, decimals = 0) =>
    n === null
      ? it
        ? "non disponibile"
        : "unavailable"
      : new Intl.NumberFormat(locale, {
          maximumFractionDigits: decimals,
        }).format(n);
  const bullets: string[] = [];
  const actions: string[] = [];
  for (const place of places
    .filter((place) => ["primary", "additionalOwn"].includes(place.role))
    .slice(0, 3)) {
    const facts = data.metrics.properties.find(
      (row) => row.listingId === place.listingId,
    );
    if (!facts) continue;
    bullets.push(
      it
        ? `${place.label}: ${fmt(facts.reviews)} recensioni raccolte, ${fmt(facts.textReviews)} con testo. Voto medio ${fmt(facts.rating, 2)}/5 su ${fmt(facts.ratedCount)} voti.`
        : `${place.label}: ${fmt(facts.reviews)} collected reviews, ${fmt(facts.textReviews)} with text. Average rating ${fmt(facts.rating, 2)}/5 from ${fmt(facts.ratedCount)} ratings.`,
    );
    if (period.kind === "quarter") {
      const priorPeriod = resolvePeriod({ ...period, year: period.year - 1 });
      const prior = data.metrics.quarters.find(
        (row) =>
          row.listingId === place.listingId &&
          row.bucket === String(priorPeriod.year),
      );
      if (
        prior &&
        windowCovered([place], priorPeriod) &&
        prior.rating !== null &&
        facts.rating !== null
      ) {
        const delta = facts.rating - prior.rating;
        const signed = new Intl.NumberFormat(locale, {
          maximumFractionDigits: 2,
          signDisplay: "always",
        }).format(delta);
        bullets.push(
          it
            ? `${place.label}: voto medio ${fmt(prior.rating, 2)} → ${fmt(facts.rating, 2)} rispetto a Q${period.quarter} ${priorPeriod.year} (${signed} punti; campioni ${fmt(prior.ratedCount)} e ${fmt(facts.ratedCount)}).`
            : `${place.label}: average rating ${fmt(prior.rating, 2)} → ${fmt(facts.rating, 2)} versus Q${period.quarter} ${priorPeriod.year} (${signed} points; samples ${fmt(prior.ratedCount)} and ${fmt(facts.ratedCount)}).`,
        );
      }
    }
    if (facts.satisfaction !== null)
      bullets.push(
        it
          ? `${place.label}: quota di voti a 4–5 stelle ${fmt(facts.satisfaction, 1)}% nel periodo selezionato.`
          : `${place.label}: 4–5-star share ${fmt(facts.satisfaction, 1)}% in the selected period.`,
      );
    const low =
      facts.ratingBreakdown["1"] +
      facts.ratingBreakdown["2"] +
      facts.ratingBreakdown["3"];
    if (low > 0 && actions.length < 2)
      actions.push(
        it
          ? `Esaminare le ${fmt(low)} recensioni con 1–3 stelle di ${place.label} per verificare i temi prima di definire interventi.`
          : `Review the ${fmt(low)} 1–3-star reviews for ${place.label} to verify themes before defining interventions.`,
      );
  }
  const competitors = places
    .filter((place) => place.role === "competitor")
    .map((place) => ({
      place,
      facts: data.metrics.properties.find(
        (row) => row.listingId === place.listingId,
      ),
    }))
    .filter(
      (row) => row.facts?.rating !== null && row.facts?.rating !== undefined,
    )
    .sort((a, b) => b.facts!.rating! - a.facts!.rating!);
  if (competitors[0]) {
    const { place, facts } = competitors[0];
    bullets.push(
      it
        ? `${place.label} ha il voto medio più alto tra i concorrenti selezionati: ${fmt(facts!.rating, 2)}/5, su ${fmt(facts!.ratedCount)} voti.`
        : `${place.label} has the highest average rating among selected competitors: ${fmt(facts!.rating, 2)}/5, from ${fmt(facts!.ratedCount)} ratings.`,
    );
  }
  if (!data.sharedL12M?.available)
    actions.push(
      it
        ? "Completare la copertura L12M prima di interpretare le quote di visitatori condivisi."
        : "Complete L12M coverage before interpreting shared-visitor shares.",
    );
  if (!bullets.length)
    bullets.push(
      it
        ? "Le conclusioni si limitano ai dati disponibili nei grafici selezionati."
        : "Findings are limited to the available data in the selected charts.",
    );
  if (!actions.length)
    actions.push(
      it
        ? "Verificare dati, campioni e copertura prima della condivisione del report."
        : "Review figures, samples and coverage before sharing this report.",
    );
  return { bullets: bullets.slice(0, 6), actions: actions.slice(0, 3) };
}
