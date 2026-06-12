import type { ClaimType } from "@/config/dimensions/shared";

export interface ClaimData {
  claimType: ClaimType;
  amount: number;
  /** ISO date string, e.g. "2026-06-12". */
  submittedAt: string;
  customFields?: Record<string, string | number>;
}

export interface ApprovalOutcome {
  autoApproved: boolean;
  /** 1-based tier index, or null when auto-approved / unrouted. */
  tier: number | null;
  approverRole: string | null;
}

export interface CustomFieldResult {
  key: string;
  ok: boolean;
  message?: string;
}

export interface ProcessResult {
  /** False when the claim type is not enabled for the tenant. */
  accepted: boolean;
  errors: string[];
  requiredDocuments: string[];
  optionalDocuments: string[];
  approval: ApprovalOutcome;
  notifications: { event: string; channels: string[] }[];
  /** ISO date (YYYY-MM-DD), or null if no SLA applies. */
  slaDeadline: string | null;
  customFieldValidation: CustomFieldResult[];
}
