import type { TenantConfig } from "@/config/tenant-config-schema";
import type { ClaimData, CustomFieldResult } from "../types";

/** Validate the claim's custom fields against the tenant's field definitions. */
export function validateCustomFields(
  config: TenantConfig,
  claim: ClaimData
): CustomFieldResult[] {
  const provided = claim.customFields ?? {};

  return config.customFields.fields.map((f): CustomFieldResult => {
    const value = provided[f.key];
    const present = value !== undefined && value !== null && value !== "";

    if (f.required && !present) {
      return { key: f.key, ok: false, message: `${f.label} is required` };
    }
    if (!present) {
      return { key: f.key, ok: true };
    }
    if (f.type === "number" && typeof value !== "number" && isNaN(Number(value))) {
      return { key: f.key, ok: false, message: `${f.label} must be a number` };
    }
    if (f.type === "select" && f.options && !f.options.includes(String(value))) {
      return {
        key: f.key,
        ok: false,
        message: `${f.label} must be one of: ${f.options.join(", ")}`,
      };
    }
    return { key: f.key, ok: true };
  });
}
