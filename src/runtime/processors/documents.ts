import type { TenantConfig } from "@/config/tenant-config-schema";
import type { ClaimData } from "../types";

/** Required + optional documents for the claim's type. */
export function resolveDocuments(config: TenantConfig, claim: ClaimData) {
  const docs = config.claimTypes.docs?.[claim.claimType];
  return {
    requiredDocuments: docs?.requiredDocs ?? [],
    optionalDocuments: docs?.optionalDocs ?? [],
  };
}
