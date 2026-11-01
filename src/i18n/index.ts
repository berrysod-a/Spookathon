"use client";

// src/i18n/index.ts
// Lightweight i18n hook and helpers.
// The dictionary is typed from en.ts; ml.ts must satisfy the same shape.

import { useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { en, type TranslationKey } from "./en";
import { ml } from "./ml";

const DICTS = { en, ml } as const;

/** Replace all {key} placeholders in a string. */
function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    str,
  );
}

/**
 * Returns a `t(key, vars?)` function bound to the current language.
 * Call at the top of any React component that renders user-visible text.
 */
export function useT() {
  const lang = useAppStore((s) => s.lang);
  const dict = DICTS[lang] as Record<string, string>;
  const fallback = en as Record<string, string>;

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      const raw = dict[key] ?? fallback[key] ?? key;
      return interpolate(raw, vars);
    },
    [dict, fallback],
  );

  return t;
}

/**
 * Non-hook version — use in server components, utility functions, or
 * anywhere hooks are not allowed.
 */
export function getT(lang: "en" | "ml") {
  const dict = DICTS[lang] as Record<string, string>;
  const fallback = en as Record<string, string>;
  return (key: TranslationKey, vars?: Record<string, string | number>): string => {
    const raw = dict[key] ?? fallback[key] ?? key;
    return interpolate(raw, vars);
  };
}

