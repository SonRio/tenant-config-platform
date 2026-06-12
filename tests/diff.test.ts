import { describe, it, expect } from "vitest";
import { diffConfigs, countDifferences } from "@/lib/diff";
import { SEED_TENANTS } from "@/config/seed-tenants";

const cfg = (slug: string) => SEED_TENANTS.find((t) => t.slug === slug)!.config;

describe("diffConfigs", () => {
  it("covers every registered dimension", () => {
    const diff = diffConfigs(cfg("safeguard"), cfg("healthfirst"));
    expect(diff.map((d) => d.dimension)).toEqual([
      "branding",
      "claimTypes",
      "approval",
      "notifications",
      "sla",
      "customFields",
    ]);
  });

  it("finds real differences between two tenants", () => {
    const diff = diffConfigs(cfg("safeguard"), cfg("govhealth"));
    expect(countDifferences(diff)).toBeGreaterThan(0);

    const branding = diff.find((d) => d.dimension === "branding")!;
    const companyRow = branding.rows.find((r) => r.label === "Company name")!;
    expect(companyRow.changed).toBe(true);
    expect(companyRow.a).toBe("SafeGuard Insurance");
    expect(companyRow.b).toBe("GovHealth Scheme");
  });

  it("reports zero differences for identical configs", () => {
    const diff = diffConfigs(cfg("safeguard"), cfg("safeguard"));
    expect(countDifferences(diff)).toBe(0);
  });

  it("flags the auto-approval threshold difference", () => {
    const diff = diffConfigs(cfg("safeguard"), cfg("healthfirst"));
    const approval = diff.find((d) => d.dimension === "approval")!;
    const threshold = approval.rows.find(
      (r) => r.label === "Auto-approval threshold"
    )!;
    expect(threshold.a).toBe("20000");
    expect(threshold.b).toBe("5000");
    expect(threshold.changed).toBe(true);
  });
});
