import type { TenantConfig } from "@/config/tenant-config-schema";
import type { ClaimData, ProcessResult } from "./types";
import { resolveDocuments } from "./processors/documents";
import { routeApproval } from "./processors/approval-routing";
import { resolveNotifications } from "./processors/notifications";
import { resolveSlaDeadline } from "./processors/sla";
import { validateCustomFields } from "./processors/custom-fields";

/**
 * The pure runtime core: given a tenant's config and a claim, decide the
 * outcome. No IO, no DB — deterministic and identical to what Preview shows.
 */
export function processClaim(
  config: TenantConfig,
  claim: ClaimData
): ProcessResult {
  const errors: string[] = [];
  const accepted = config.claimTypes.enabledTypes.includes(claim.claimType);
  if (!accepted) {
    errors.push(`Claim type ${claim.claimType} is not enabled for this tenant`);
  }

  const customFieldValidation = validateCustomFields(config, claim);
  for (const r of customFieldValidation) {
    if (!r.ok && r.message) errors.push(r.message);
  }

  if (!accepted) {
    return {
      accepted: false,
      errors,
      requiredDocuments: [],
      optionalDocuments: [],
      approval: { autoApproved: false, tier: null, approverRole: null },
      notifications: [],
      slaDeadline: null,
      customFieldValidation,
    };
  }

  const { requiredDocuments, optionalDocuments } = resolveDocuments(config, claim);

  return {
    accepted: true,
    errors,
    requiredDocuments,
    optionalDocuments,
    approval: routeApproval(config, claim),
    notifications: resolveNotifications(config),
    slaDeadline: resolveSlaDeadline(config, claim),
    customFieldValidation,
  };
}
