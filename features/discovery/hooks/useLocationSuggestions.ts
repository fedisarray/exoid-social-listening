"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLocationSuggestions } from "../actions/getLocationSuggestions";

export function useLocationSuggestions(
  query: string,
  country: string,
  locale: string,
  enabled: boolean,
) {
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(timer);
  }, [query]);
  const result = useQuery({
    queryKey: ["location-suggestions", debounced, country, locale],
    queryFn: () =>
      getLocationSuggestions({ query: debounced, country, locale }),
    enabled:
      enabled &&
      query === debounced &&
      query.trim().length >= 3 &&
      /^[A-Z]{2}$/.test(country),
    staleTime: 86400_000,
    retry: false,
  });
  return {
    ...result,
    data: query === debounced ? result.data : undefined,
    isPending: query !== debounced || result.isPending,
    isError: query === debounced && result.isError,
  };
}
