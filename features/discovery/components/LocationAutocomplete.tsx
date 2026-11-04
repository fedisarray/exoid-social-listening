"use client";
import { useEffect, useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocationSuggestions } from "../hooks/useLocationSuggestions";
import type { LocationSuggestion } from "../schemas/getLocationSuggestionsOutput";

export function LocationAutocomplete({
  value,
  country,
  selected,
  disabled,
  invalid,
  onChange,
  onSelect,
}: {
  value: string;
  country: string;
  selected: boolean;
  disabled: boolean;
  invalid: boolean;
  onChange: (value: string) => void;
  onSelect: (place: LocationSuggestion) => void;
}) {
  const t = useTranslations("app");
  const locale = useLocale();
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const show = focused && !selected && !disabled;
  const suggestions = useLocationSuggestions(value, country, locale, show);
  const places = suggestions.data ?? [];
  const expanded = show && places.length > 0;
  useEffect(() => {
    if (expanded && active >= 0)
      document
        .getElementById(`${id}-option-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, expanded, id]);
  function select(place: LocationSuggestion) {
    onSelect(place);
    setFocused(false);
    setActive(-1);
  }
  return (
    <div
      className="space-y-2"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <Label htmlFor={id}>{t("location")}</Label>
      <div className="relative">
        <Input
          id={id}
          name="location"
          value={value}
          maxLength={150}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={expanded ? `${id}-options` : undefined}
          aria-activedescendant={
            expanded && active >= 0 && active < places.length
              ? `${id}-option-${active}`
              : undefined
          }
          aria-describedby={`${id}-hint`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onChange={(event) => {
            onChange(event.target.value);
            setActive(-1);
            setFocused(true);
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "Escape" && focused) {
              event.preventDefault();
              event.stopPropagation();
              setFocused(false);
            }
            if (["ArrowDown", "ArrowUp"].includes(event.key)) {
              event.preventDefault();
              setFocused(true);
              if (places.length)
                setActive((index) =>
                  event.key === "ArrowDown"
                    ? (index + 1) % places.length
                    : (index <= 0 ? places.length : index) - 1,
                );
            }
            if (event.key === "Enter" && expanded) {
              event.preventDefault();
              if (active >= 0 && places[active]) select(places[active]);
            }
          }}
        />
        {expanded ? (
          <ul
            id={`${id}-options`}
            role="listbox"
            aria-label={t("locationSuggestions")}
            className="absolute inset-x-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground"
          >
            {places.map((place, index) => (
              <li key={place.id}>
                <button
                  type="button"
                  role="option"
                  id={`${id}-option-${index}`}
                  aria-selected={active === index}
                  tabIndex={-1}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                    active === index && "bg-accent text-accent-foreground",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => select(place)}
                >
                  {place.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p
        id={`${id}-hint`}
        role="status"
        className={cn(
          "text-xs text-muted-foreground",
          invalid && "text-destructive",
        )}
      >
        {invalid
          ? t("locationRequired")
          : show && value.trim().length >= 3
            ? !/^[A-Z]{2}$/.test(country)
              ? t("locationCountry")
              : suggestions.isError
                ? t("locationError")
                : suggestions.isPending || suggestions.isFetching
                  ? t("locationLoading")
                  : places.length
                    ? t("locationHint")
                    : t("locationEmpty")
            : t("locationHint")}
      </p>
      {show && suggestions.isError ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => suggestions.refetch()}
        >
          {t("locationRetry")}
        </Button>
      ) : null}
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        className="inline-block text-xs text-muted-foreground underline underline-offset-4"
      >
        © OpenStreetMap
      </a>
    </div>
  );
}
