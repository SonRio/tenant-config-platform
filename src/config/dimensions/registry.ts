import type { ConfigDimension } from "./types";
import { branding } from "./branding";
import { claimTypes } from "./claim-types";
import { approval } from "./approval";
import { notifications } from "./notifications";
import { sla } from "./sla";
import { customFields } from "./custom-fields";

/**
 * The dimension registry. Validation, the admin form, the diff view, and the
 * preview all iterate this array — so adding a config dimension is: create one
 * dimension file and append it here. Nothing else iterating the registry needs
 * to change.
 */
export const REGISTRY: ConfigDimension[] = [
  branding,
  claimTypes,
  approval,
  notifications,
  sla,
  customFields,
];

export { branding, claimTypes, approval, notifications, sla, customFields };
