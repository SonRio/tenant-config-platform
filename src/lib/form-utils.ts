/** Read a nested react-hook-form error message by dot path (e.g. "config.branding.companyName"). */
export function errorMessage(
  errors: unknown,
  path: string
): string | undefined {
  let cur: unknown = errors;
  for (const seg of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  const message = (cur as { message?: unknown } | undefined)?.message;
  return typeof message === "string" ? message : undefined;
}
