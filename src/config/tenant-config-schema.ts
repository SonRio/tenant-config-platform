import { z } from "zod";
import { REGISTRY } from "./dimensions/registry";
import { brandingSchema } from "./dimensions/branding";
import { claimTypesSchema } from "./dimensions/claim-types";
import { approvalSchema } from "./dimensions/approval";
import { notificationsSchema } from "./dimensions/notifications";
import { slaSchema } from "./dimensions/sla";
import { customFieldsSchema } from "./dimensions/custom-fields";
import type { ClaimType } from "./dimensions/shared";

/**
 * The full tenant config schema. The explicit shape gives us a precise static
 * `TenantConfig` type (which processClaim relies on), while REGISTRY drives the
 * dynamic layers (form/diff/preview). Adding a dimension means: write the file,
 * add one line here, and add one line to REGISTRY.
 */
const shape = {
  branding: brandingSchema,
  claimTypes: claimTypesSchema,
  approval: approvalSchema,
  notifications: notificationsSchema,
  sla: slaSchema,
  customFields: customFieldsSchema,
};

// Guard against drift: the typed `shape` and the iterable REGISTRY must
// describe the exact same set of dimensions. Fails fast at module load.
const shapeKeys = Object.keys(shape).sort().join(",");
const registryKeys = REGISTRY.map((d) => d.key).sort().join(",");
if (shapeKeys !== registryKeys) {
  throw new Error(
    `Config dimension drift — schema shape [${shapeKeys}] != registry [${registryKeys}]`
  );
}

export const tenantConfigSchema = z.object(shape).superRefine((config, ctx) => {
  const enabled = new Set<ClaimType>(config.claimTypes.enabledTypes);

  // Every enabled claim type needs an SLA so the runtime can always compute a
  // deadline; and SLA entries for disabled types are meaningless.
  for (const type of enabled) {
    if (config.sla.perType[type] === undefined) {
      ctx.addIssue({
        code: "custom",
        message: `Enabled claim type ${type} has no SLA configured`,
        path: ["sla", "perType", type],
      });
    }
  }
  for (const type of Object.keys(config.sla.perType) as ClaimType[]) {
    if (!enabled.has(type)) {
      ctx.addIssue({
        code: "custom",
        message: `SLA set for disabled claim type ${type}`,
        path: ["sla", "perType", type],
      });
    }
  }

  // Document requirements should only target enabled claim types.
  for (const type of Object.keys(config.claimTypes.docs ?? {}) as ClaimType[]) {
    if (!enabled.has(type)) {
      ctx.addIssue({
        code: "custom",
        message: `Documents set for disabled claim type ${type}`,
        path: ["claimTypes", "docs", type],
      });
    }
  }
});

export type TenantConfig = z.infer<typeof tenantConfigSchema>;

/** Seed config for a brand-new tenant — assembled from each dimension's default. */
export function defaultConfig(): TenantConfig {
  const cfg = Object.fromEntries(
    REGISTRY.map((d) => [d.key, structuredClone(d.default)])
  );
  return cfg as TenantConfig;
}
