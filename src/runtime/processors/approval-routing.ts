import type { TenantConfig } from "@/config/tenant-config-schema";
import type { ClaimData, ApprovalOutcome } from "../types";

/**
 * Route a claim for approval. Amounts strictly below the auto-approval
 * threshold are auto-approved. Otherwise the matching tier is found by amount,
 * using inclusive-min / exclusive-max ranges (the last tier is unbounded).
 */
export function routeApproval(
  config: TenantConfig,
  claim: ClaimData
): ApprovalOutcome {
  const { autoApprovalThreshold, tiers } = config.approval;

  if (claim.amount < autoApprovalThreshold) {
    return { autoApproved: true, tier: null, approverRole: null };
  }

  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    const inRange =
      claim.amount >= t.minAmount &&
      (t.maxAmount === null || claim.amount < t.maxAmount);
    if (inRange) {
      return { autoApproved: false, tier: i + 1, approverRole: t.approverRole };
    }
  }

  // Schema guarantees tiers start at 0, are contiguous, and the last is
  // unbounded — so every amount ≥ 0 matches exactly one tier. Unreachable for
  // valid configs; stay safe rather than throw.
  return { autoApproved: false, tier: null, approverRole: null };
}
