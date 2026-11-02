export function setLocale(locale: "it" | "en"): {
  name: string;
  value: string;
} {
  return { name: "locale", value: locale };
}
