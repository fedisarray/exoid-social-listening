export const analysisKeys = {
  detail: (id: string) => ["analyses", "detail", id] as const,
  list: () => ["analyses", "list"] as const,
};
