import type { Locale } from "./config";
import { en, type Dictionary } from "./en";
import { vi } from "./vi";

export const dictionaries: Record<Locale, Dictionary> = { en, vi };

export type { Dictionary };

/** Resolve a dot-path key against a dictionary and interpolate {var} tokens. */
export function translate(
  dict: Dictionary,
  path: string,
  vars?: Record<string, string | number>
): string {
  let cur: unknown = dict;
  for (const seg of path.split(".")) {
    if (cur && typeof cur === "object" && seg in cur) {
      cur = (cur as Record<string, unknown>)[seg];
    } else {
      return path; // missing key → surface the key for quick debugging
    }
  }
  if (typeof cur !== "string") return path;
  if (!vars) return cur;
  return cur.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`
  );
}
