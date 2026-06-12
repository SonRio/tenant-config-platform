import { describe, it, expect } from "vitest";
import { processClaim } from "@/runtime/process-claim";
import { addBusinessDays } from "@/runtime/processors/sla";
import { SEED_TENANTS } from "@/config/seed-tenants";
import type { ClaimData } from "@/runtime/types";

const byslug = (slug: string) =>
  SEED_TENANTS.find((t) => t.slug === slug)!.config;
const safeguard = byslug("safeguard");
const healthfirst = byslug("healthfirst");
const govhealth = byslug("govhealth");

describe("processClaim — 3 tenants, one claim, three outcomes", () => {
  const claim: ClaimData = {
    claimType: "INPATIENT",
    amount: 50000,
    submittedAt: "2026-06-12", // a Friday
  };

  const sg = processClaim(safeguard, claim);
  const hf = processClaim(healthfirst, claim);
  const gh = processClaim(govhealth, claim);

  it("all accept the INPATIENT claim", () => {
    expect([sg.accepted, hf.accepted, gh.accepted]).toEqual([true, true, true]);
  });

  it("routes approval differently", () => {
    expect(sg.approval.approverRole).toBe("Team Lead"); // 50000 in 50k–200k
    expect(hf.approval.approverRole).toBe("Assessor"); // 50000 in 0–100k
    expect(gh.approval.approverRole).toBe("Review Committee"); // single tier
    const roles = [
      sg.approval.approverRole,
      hf.approval.approverRole,
      gh.approval.approverRole,
    ];
    expect(new Set(roles).size).toBe(3);
  });

  it("computes different SLA deadlines", () => {
    expect(sg.slaDeadline).not.toBe(hf.slaDeadline);
    expect(hf.slaDeadline).not.toBe(gh.slaDeadline);
    expect(sg.slaDeadline).not.toBe(gh.slaDeadline);
  });

  it("produces different notification channel sets", () => {
    const channels = (r: typeof sg) =>
      r.notifications.flatMap((n) => n.channels).sort().join(",");
    expect(new Set([channels(sg), channels(hf), channels(gh)]).size).toBe(3);
  });
});

describe("approval routing", () => {
  it("auto-approves strictly below threshold", () => {
    const r = processClaim(safeguard, {
      claimType: "OUTPATIENT",
      amount: 19999,
      submittedAt: "2026-06-12",
    });
    expect(r.approval.autoApproved).toBe(true);
    expect(r.approval.tier).toBeNull();
  });

  it("does NOT auto-approve at exactly the threshold", () => {
    const r = processClaim(safeguard, {
      claimType: "OUTPATIENT",
      amount: 20000,
      submittedAt: "2026-06-12",
    });
    expect(r.approval.autoApproved).toBe(false);
    expect(r.approval.approverRole).toBe("Assessor"); // 20000 in 0–50k
  });

  it("matches tier by inclusive-min / exclusive-max", () => {
    // 50000 is the boundary: belongs to tier 2 (50k–200k), not tier 1.
    const r = processClaim(safeguard, {
      claimType: "INPATIENT",
      amount: 50000,
      submittedAt: "2026-06-12",
    });
    expect(r.approval.tier).toBe(2);
    expect(r.approval.approverRole).toBe("Team Lead");
  });

  it("govhealth auto-approves nothing (threshold 0)", () => {
    const r = processClaim(govhealth, {
      claimType: "OUTPATIENT",
      amount: 1,
      submittedAt: "2026-06-12",
    });
    expect(r.approval.autoApproved).toBe(false);
    expect(r.approval.approverRole).toBe("Review Committee");
  });
});

describe("claim type acceptance", () => {
  it("rejects a claim type not enabled for the tenant", () => {
    // GovHealth only enables OUTPATIENT/INPATIENT.
    const r = processClaim(govhealth, {
      claimType: "DENTAL",
      amount: 100,
      submittedAt: "2026-06-12",
    });
    expect(r.accepted).toBe(false);
    expect(r.errors.join(" ")).toMatch(/DENTAL/);
    expect(r.slaDeadline).toBeNull();
  });
});

describe("custom field validation", () => {
  it("flags missing required fields (GovHealth)", () => {
    const r = processClaim(govhealth, {
      claimType: "OUTPATIENT",
      amount: 100,
      submittedAt: "2026-06-12",
    });
    const failed = r.customFieldValidation.filter((c) => !c.ok).map((c) => c.key);
    expect(failed).toContain("department");
    expect(failed).toContain("budgetCode");
    expect(r.errors.length).toBeGreaterThan(0);
  });

  it("passes when required fields are provided", () => {
    const r = processClaim(govhealth, {
      claimType: "OUTPATIENT",
      amount: 100,
      submittedAt: "2026-06-12",
      customFields: { department: "Cardiology", budgetCode: "BC-100" },
    });
    expect(r.customFieldValidation.every((c) => c.ok)).toBe(true);
  });
});

describe("documents", () => {
  it("returns the tenant's required docs for the claim type", () => {
    const r = processClaim(safeguard, {
      claimType: "INPATIENT",
      amount: 100,
      submittedAt: "2026-06-12",
    });
    expect(r.requiredDocuments).toContain("Discharge summary");
    expect(r.optionalDocuments).toContain("Referral letter");
  });
});

describe("addBusinessDays", () => {
  it("Friday + 1 business day = Monday", () => {
    expect(addBusinessDays("2026-06-12", 1)).toBe("2026-06-15"); // Fri -> Mon
  });
  it("skips the weekend across multiple days", () => {
    expect(addBusinessDays("2026-06-12", 3)).toBe("2026-06-17"); // Fri -> Wed
  });
});
