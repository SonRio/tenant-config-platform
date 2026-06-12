import type { TenantConfig } from "./tenant-config-schema";

export interface SeedTenant {
  slug: string;
  name: string;
  config: TenantConfig;
}

/**
 * Three insurers with deliberately divergent rules. The same claim run through
 * each must yield three different outcomes — the platform's headline behavior.
 */
export const SEED_TENANTS: SeedTenant[] = [
  {
    slug: "safeguard",
    name: "SafeGuard (Corporate)",
    config: {
      branding: {
        companyName: "SafeGuard Insurance",
        logoUrl: "",
        primaryColor: "#1d4ed8",
        secondaryColor: "#0f172a",
      },
      claimTypes: {
        enabledTypes: ["OUTPATIENT", "INPATIENT", "DENTAL"],
        docs: {
          OUTPATIENT: { requiredDocs: ["Receipt", "Diagnosis report"], optionalDocs: [] },
          INPATIENT: {
            requiredDocs: ["Discharge summary", "Itemized bill"],
            optionalDocs: ["Referral letter"],
          },
          DENTAL: { requiredDocs: ["Dental chart"], optionalDocs: [] },
        },
      },
      approval: {
        autoApprovalThreshold: 20000,
        tiers: [
          { minAmount: 0, maxAmount: 50000, approverRole: "Assessor" },
          { minAmount: 50000, maxAmount: 200000, approverRole: "Team Lead" },
          { minAmount: 200000, maxAmount: null, approverRole: "Director" },
        ],
      },
      notifications: {
        events: [
          { event: "claim_submitted", channels: ["email"] },
          { event: "claim_approved", channels: ["email"] },
        ],
      },
      sla: {
        perType: { OUTPATIENT: 5, INPATIENT: 10, DENTAL: 7 },
        escalation: { notifyRole: "Operations Manager" },
      },
      customFields: {
        fields: [
          { key: "employeeId", label: "Employee ID", type: "text", required: true },
        ],
      },
    },
  },
  {
    slug: "healthfirst",
    name: "HealthFirst (Retail)",
    config: {
      branding: {
        companyName: "HealthFirst",
        logoUrl: "",
        primaryColor: "#059669",
        secondaryColor: "#064e3b",
      },
      claimTypes: {
        enabledTypes: ["OUTPATIENT", "INPATIENT", "DENTAL", "MATERNITY", "OPTICAL"],
        docs: {
          OUTPATIENT: { requiredDocs: ["Receipt"], optionalDocs: [] },
          INPATIENT: { requiredDocs: ["Discharge summary"], optionalDocs: [] },
          DENTAL: { requiredDocs: ["Dental chart"], optionalDocs: [] },
          MATERNITY: { requiredDocs: ["Maternity record"], optionalDocs: [] },
          OPTICAL: { requiredDocs: ["Prescription"], optionalDocs: [] },
        },
      },
      approval: {
        autoApprovalThreshold: 5000,
        tiers: [
          { minAmount: 0, maxAmount: 100000, approverRole: "Assessor" },
          { minAmount: 100000, maxAmount: null, approverRole: "Manager" },
        ],
      },
      notifications: {
        events: [
          { event: "claim_submitted", channels: ["email", "sms"] },
          { event: "payment_sent", channels: ["email", "sms"] },
        ],
      },
      sla: {
        perType: {
          OUTPATIENT: 7,
          INPATIENT: 7,
          DENTAL: 7,
          MATERNITY: 7,
          OPTICAL: 7,
        },
        escalation: { notifyRole: "Team Lead" },
      },
      customFields: { fields: [] },
    },
  },
  {
    slug: "govhealth",
    name: "GovHealth (Government)",
    config: {
      branding: {
        companyName: "GovHealth Scheme",
        logoUrl: "",
        primaryColor: "#b45309",
        secondaryColor: "#78350f",
      },
      claimTypes: {
        enabledTypes: ["OUTPATIENT", "INPATIENT"],
        docs: {
          OUTPATIENT: { requiredDocs: ["Receipt", "ID copy"], optionalDocs: [] },
          INPATIENT: {
            requiredDocs: ["Discharge summary", "ID copy", "Authorization form"],
            optionalDocs: [],
          },
        },
      },
      approval: {
        // Nothing auto-approves: every claim goes to the review committee.
        autoApprovalThreshold: 0,
        tiers: [{ minAmount: 0, maxAmount: null, approverRole: "Review Committee" }],
      },
      notifications: {
        events: [
          { event: "claim_submitted", channels: ["email", "webhook"] },
          { event: "claim_rejected", channels: ["email", "webhook"] },
        ],
      },
      sla: {
        perType: { OUTPATIENT: 15, INPATIENT: 15 },
        escalation: { notifyRole: "Department Head" },
      },
      customFields: {
        fields: [
          { key: "department", label: "Department", type: "text", required: true },
          { key: "budgetCode", label: "Budget Code", type: "text", required: true },
        ],
      },
    },
  },
];
