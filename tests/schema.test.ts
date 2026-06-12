import { describe, it, expect } from "vitest";
import {
  tenantConfigSchema,
  defaultConfig,
  type TenantConfig,
} from "@/config/tenant-config-schema";

function validConfig(): TenantConfig {
  return {
    branding: {
      companyName: "Acme",
      logoUrl: "",
      primaryColor: "#2563eb",
      secondaryColor: "#1e293b",
    },
    claimTypes: {
      enabledTypes: ["OUTPATIENT", "INPATIENT"],
      docs: {
        OUTPATIENT: { requiredDocs: ["Receipt"], optionalDocs: [] },
        INPATIENT: { requiredDocs: ["Discharge summary"], optionalDocs: [] },
      },
    },
    approval: {
      autoApprovalThreshold: 1000,
      tiers: [
        { minAmount: 0, maxAmount: 5000, approverRole: "Assessor" },
        { minAmount: 5000, maxAmount: null, approverRole: "Manager" },
      ],
    },
    notifications: {
      events: [{ event: "claim_submitted", channels: ["email"] }],
    },
    sla: {
      perType: { OUTPATIENT: 5, INPATIENT: 10 },
      escalation: { notifyRole: "Supervisor" },
    },
    customFields: { fields: [] },
  };
}

describe("tenantConfigSchema", () => {
  it("defaultConfig() is valid", () => {
    expect(() => tenantConfigSchema.parse(defaultConfig())).not.toThrow();
  });

  it("accepts a well-formed config", () => {
    expect(() => tenantConfigSchema.parse(validConfig())).not.toThrow();
  });

  it("rejects zero enabled claim types", () => {
    const c = validConfig();
    c.claimTypes.enabledTypes = [];
    expect(() => tenantConfigSchema.parse(c)).toThrow();
  });

  it("rejects a negative auto-approval threshold", () => {
    const c = validConfig();
    c.approval.autoApprovalThreshold = -1;
    expect(() => tenantConfigSchema.parse(c)).toThrow();
  });

  it("rejects SLA of 0", () => {
    const c = validConfig();
    c.sla.perType.OUTPATIENT = 0;
    expect(() => tenantConfigSchema.parse(c)).toThrow();
  });

  it("rejects approval tiers with a gap", () => {
    const c = validConfig();
    c.approval.tiers = [
      { minAmount: 0, maxAmount: 5000, approverRole: "A" },
      { minAmount: 6000, maxAmount: null, approverRole: "B" },
    ];
    expect(() => tenantConfigSchema.parse(c)).toThrow();
  });

  it("rejects a first tier that does not start at 0 (no unrouted band)", () => {
    const c = validConfig();
    c.approval.tiers = [
      { minAmount: 100, maxAmount: 5000, approverRole: "A" },
      { minAmount: 5000, maxAmount: null, approverRole: "B" },
    ];
    expect(() => tenantConfigSchema.parse(c)).toThrow();
  });

  it("rejects a non-unbounded last tier", () => {
    const c = validConfig();
    c.approval.tiers = [{ minAmount: 0, maxAmount: 5000, approverRole: "A" }];
    expect(() => tenantConfigSchema.parse(c)).toThrow();
  });

  it("rejects an enabled claim type with no SLA", () => {
    const c = validConfig();
    delete c.sla.perType.INPATIENT;
    expect(() => tenantConfigSchema.parse(c)).toThrow();
  });

  it("rejects SLA for a disabled claim type", () => {
    const c = validConfig();
    c.sla.perType.DENTAL = 5;
    expect(() => tenantConfigSchema.parse(c)).toThrow();
  });
});
