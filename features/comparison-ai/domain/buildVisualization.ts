import type { Visualization } from "../schemas/workspace";

type Review = {
  id: string;
  published_at: string | null;
  listing_id: string | null;
  listing_label: string | null;
  review_text: string;
};
type Annotation = { review_id: string; sentiment: string; themes: string[] };
type ChartType = Visualization["type"];
const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "was",
  "were",
  "are",
  "you",
  "but",
  "not",
  "from",
  "have",
  "has",
  "had",
  "very",
  "they",
  "there",
  "their",
  "would",
  "could",
  "our",
  "your",
  "into",
  "when",
  "what",
  "how",
  "all",
  "just",
  "too",
  "its",
  "also",
  "can",
  "will",
  "been",
  "than",
  "then",
  "them",
  "who",
  "out",
  "one",
  "his",
  "her",
  "she",
  "him",
  "about",
  "because",
  "after",
  "before",
  "over",
  "under",
  "more",
  "most",
  "some",
  "much",
  "many",
  "other",
  "only",
  "again",
  "really",
  "got",
  "get",
  "did",
  "does",
  "como",
  "della",
  "delle",
  "dello",
  "dell",
  "che",
  "con",
  "per",
  "una",
  "uno",
  "gli",
  "dalla",
  "dalle",
  "dallo",
  "dai",
  "dei",
  "del",
  "nel",
  "nella",
  "nelle",
  "nello",
  "non",
  "sono",
  "era",
  "anche",
  "molto",
  "tutto",
  "tutti",
  "tutte",
  "questo",
  "questa",
  "quello",
  "quella",
  "più",
  "meno",
  "alla",
  "alle",
  "allo",
  "agli",
  "come",
  "dopo",
  "prima",
  "loro",
  "noi",
  "voi",
  "qui",
  "dove",
  "quando",
  "sempre",
  "solo",
  "poi",
  "però",
  "ma",
  "si",
  "è",
  "il",
  "lo",
  "la",
  "i",
  "le",
  "un",
  "in",
  "di",
  "da",
  "a",
  "e",
  "o",
  "su",
]);
const sentiments = ["positive", "negative", "mixed", "unclassified"] as const;

export function buildVisualization(
  type: ChartType,
  reviews: Review[],
  annotations: Annotation[],
): Visualization {
  const byId = new Map(
    annotations.map((annotation) => [annotation.review_id, annotation]),
  );
  if (type === "word_cloud") {
    const counts = new Map<string, number>();
    for (const review of reviews)
      for (const token of review.review_text
        .toLocaleLowerCase()
        .match(/[\p{L}]{3,}/gu) ?? [])
        if (!stopWords.has(token))
          counts.set(token, (counts.get(token) ?? 0) + 1);
    return {
      type,
      data: [...counts]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 80)
        .map(([text, value]) => ({
          text,
          value,
          filterKind: "word",
          filterValue: text,
        })),
    };
  }
  if (type === "sentiment") {
    const counts = new Map<string, number>(sentiments.map((item) => [item, 0]));
    for (const review of reviews) {
      const sentiment = byId.get(review.id)?.sentiment ?? "unclassified";
      counts.set(sentiment, (counts.get(sentiment) ?? 0) + 1);
    }
    return {
      type,
      data: [...counts].map(([name, count]) => ({
        name,
        count,
        filterKind: "sentiment",
        filterValue: name,
      })),
    };
  }
  const buckets = new Map<
    string,
    Record<(typeof sentiments)[number], number>
  >();
  const themes = new Map<string, Record<(typeof sentiments)[number], number>>();
  for (const review of reviews) {
    const annotation = byId.get(review.id);
    const sentiment = (
      sentiments.includes(annotation?.sentiment as (typeof sentiments)[number])
        ? annotation?.sentiment
        : "unclassified"
    ) as (typeof sentiments)[number];
    const month = review.published_at?.slice(0, 7) ?? "undated";
    const listing = review.listing_label ?? "Unassigned";
    const ensure = (map: typeof buckets, key: string) => {
      if (!map.has(key))
        map.set(key, { positive: 0, negative: 0, mixed: 0, unclassified: 0 });
      map.get(key)![sentiment]++;
    };
    if (type === "sentiment_trend" || type === "area") ensure(buckets, month);
    if (type === "listing_comparison" || type === "radar")
      ensure(buckets, listing);
    if (type === "themes") {
      for (const theme of annotation?.themes ?? []) ensure(themes, theme);
    }
  }
  if (type === "sentiment_trend" || type === "area")
    return {
      type,
      data: [...buckets]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, counts]) => ({
          month,
          ...counts,
          filterKind: "month",
          filterValue: month,
        })),
    };
  if (type === "listing_comparison" || type === "radar")
    return {
      type,
      data: [...buckets].map(([name, counts]) => ({
        name,
        ...counts,
        filterKind: "listing",
        filterValue: name,
      })),
    };
  return {
    type,
    data: [...themes]
      .sort((a, b) => sum(b[1]) - sum(a[1]))
      .slice(0, 30)
      .map(([name, counts]) => ({
        name,
        ...counts,
        filterKind: "theme",
        filterValue: name,
      })),
  };
}
function sum(counts: Record<string, number>): number {
  return Object.values(counts).reduce((total, count) => total + count, 0);
}
