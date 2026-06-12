import { z } from "zod";
import { tenantConfigSchema } from "@/config/tenant-config-schema";

/**
 * What the admin form (and create/update API) accepts: tenant identity plus the
 * full validated config. Config validation is delegated to the single source of
 * truth, tenantConfigSchema.
 */
export const tenantFormSchema = z.object({
  name: z.string().min(1, "Tenant name is required"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  config: tenantConfigSchema,
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;
