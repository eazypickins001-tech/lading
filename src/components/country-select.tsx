"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, findCountry, type Country } from "@/lib/countries";

type CountrySelectProps = {
  name: string;
  id?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
};

const baseInputClass =
  "w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-signal-teal focus:ring-1 focus:ring-signal-teal";

function searchCountries(query: string): Country[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length === 0) {
    return COUNTRIES.slice(0, 8);
  }
  const ranked: { country: Country; rank: number }[] = [];
  for (const country of COUNTRIES) {
    const name = country.name.toLowerCase();
    const code = country.code.toLowerCase();
    let rank = -1;
    if (code === trimmed) {
      rank = 0;
    } else if (name === trimmed) {
      rank = 1;
    } else if (name.startsWith(trimmed)) {
      rank = 2;
    } else if (code.startsWith(trimmed)) {
      rank = 3;
    } else if (name.includes(trimmed)) {
      rank = 4;
    }
    if (rank >= 0) {
      ranked.push({ country, rank });
    }
  }
  ranked.sort(
    (a, b) =>
      a.rank - b.rank || a.country.name.localeCompare(b.country.name),
  );
  return ranked.slice(0, 8).map((entry) => entry.country);
}

export function CountrySelect({
  name,
  id,
  defaultValue = "",
  placeholder = "Country",
  className = "",
  required = false,
}: CountrySelectProps) {
  const initial = useMemo(() => findCountry(defaultValue), [defaultValue]);
  const [text, setText] = useState(initial ? initial.name : defaultValue);
  const [value, setValue] = useState(
    initial ? initial.code : defaultValue.trim().toUpperCase(),
  );
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => searchCountries(text), [text]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      if (!container.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleChange = (next: string) => {
    setText(next);
    const trimmed = next.trim();
    const lower = trimmed.toLowerCase();
    const exact = COUNTRIES.find(
      (country) =>
        country.code.toLowerCase() === lower ||
        country.name.toLowerCase() === lower,
    );
    setValue(exact ? exact.code : trimmed.toUpperCase());
    setOpen(true);
    setHighlight(0);
  };

  const selectCountry = (country: Country) => {
    setText(country.name);
    setValue(country.code);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlight((current) =>
        matches.length === 0 ? 0 : (current + 1) % matches.length,
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlight((current) =>
        matches.length === 0
          ? 0
          : (current - 1 + matches.length) % matches.length,
      );
      return;
    }
    if (event.key === "Enter") {
      if (open && matches[highlight]) {
        event.preventDefault();
        selectCountry(matches[highlight]);
      }
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${id ?? name}-listbox`}
        aria-activedescendant={
          open && matches[highlight]
            ? `${id ?? name}-option-${matches[highlight].code}`
            : undefined
        }
        value={text}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => {
          setOpen(true);
          setHighlight(0);
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        className={`${baseInputClass} ${className}`}
      />
      <input type="hidden" name={name} value={value} />
      {open && matches.length > 0 ? (
        <ul
          id={`${id ?? name}-listbox`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-hairline bg-white py-1 shadow-lg"
        >
          {matches.map((country, index) => (
            <li
              key={country.code}
              id={`${id ?? name}-option-${country.code}`}
              role="option"
              aria-selected={index === highlight}
              onMouseDown={(event) => {
                event.preventDefault();
                selectCountry(country);
              }}
              onMouseEnter={() => setHighlight(index)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm text-ink ${
                index === highlight ? "bg-cloud" : "hover:bg-cloud"
              }`}
            >
              <span>{country.name}</span>
              <span className="font-mono text-xs text-muted">
                {country.code}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
