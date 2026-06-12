import { z } from "zod";
import { defineDimension } from "./types";
import { claimTypeSchema, CLAIM_TYPES, type ClaimType } from "./shared";

const docListSchema = z.array(z.string().min(1)).default([]);

const perTypeDocsSchema = z.object({
  requiredDocs: docListSchema,
  optionalDocs: docListSchema,
});

export const claimTypesSchema = z
  .object({
    enabledTypes: z
      .array(claimTypeSchema)
      .min(1, "Enable at least one claim type"),
    // Per-type document requirements. Only enabled types need an entry.
    docs: z.partialRecord(claimTypeSchema, perTypeDocsSchema).default({}),
  })
  .superRefine((val, ctx) => {
    const seen = new Set<ClaimType>();
    val.enabledTypes.forEach((t, i) => {
      if (seen.has(t)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate claim type: ${t}`,
          path: ["enabledTypes", i],
        });
      }
      seen.add(t);
    });
  });

export type ClaimTypesConfig = z.infer<typeof claimTypesSchema>;

const emptyDocs = () => ({ requiredDocs: [], optionalDocs: [] });

export const claimTypes = defineDimension<ClaimTypesConfig>({
  key: "claimTypes",
  title: "Claim Types",
  schema: claimTypesSchema,
  default: {
    enabledTypes: ["OUTPATIENT"],
    docs: { OUTPATIENT: emptyDocs() },
  },
  summarize: (v) => [
    { label: "Enabled types", value: v.enabledTypes.join(", ") || "—" },
    ...CLAIM_TYPES.filter((t) => v.enabledTypes.includes(t)).map((t) => ({
      label: `${t} required docs`,
      value: v.docs?.[t]?.requiredDocs?.join(", ") || "—",
    })),
  ],
});
