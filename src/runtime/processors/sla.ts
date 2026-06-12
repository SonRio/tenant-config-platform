import type { TenantConfig } from "@/config/tenant-config-schema";
import type { ClaimData } from "../types";

/**
 * Add N business days (skipping Sat/Sun) to a date, working in UTC date-only to
 * avoid timezone drift. No public-holiday calendar (out of scope).
 */
export function addBusinessDays(startISO: string, days: number): string {
  const d = new Date(startISO);
  const cur = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
  let added = 0;
  while (added < days) {
    cur.setUTCDate(cur.getUTCDate() + 1);
    const dow = cur.getUTCDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return cur.toISOString().slice(0, 10);
}

/** SLA deadline for the claim, or null if no SLA is configured for its type. */
export function resolveSlaDeadline(
  config: TenantConfig,
  claim: ClaimData
): string | null {
  const days = config.sla.perType[claim.claimType];
  if (days === undefined) return null;
  return addBusinessDays(claim.submittedAt, days);
}
