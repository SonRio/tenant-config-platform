import { z } from "zod";
import { defineDimension } from "./types";
import { fieldTypeSchema } from "./shared";

const fieldSchema = z.object({
  key: z.string().min(1, "Field key is required"),
  label: z.string().min(1, "Field label is required"),
  type: fieldTypeSchema,
  required: z.boolean().default(false),
  options: z.array(z.string().min(1)).optional(),
});

export const customFieldsSchema = z
  .object({
    fields: z.array(fieldSchema).default([]),
  })
  .superRefine((val, ctx) => {
    const seen = new Set<string>();
    val.fields.forEach((f, i) => {
      if (seen.has(f.key)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate field key: ${f.key}`,
          path: ["fields", i, "key"],
        });
      }
      seen.add(f.key);
      if (f.type === "select" && (!f.options || f.options.length === 0)) {
        ctx.addIssue({
          code: "custom",
          message: "Select fields need at least one option",
          path: ["fields", i, "options"],
        });
      }
    });
  });

export type CustomFieldsConfig = z.infer<typeof customFieldsSchema>;

export const customFields = defineDimension<CustomFieldsConfig>({
  key: "customFields",
  title: "Custom Fields",
  schema: customFieldsSchema,
  default: { fields: [] },
  summarize: (v) =>
    v.fields.length === 0
      ? [{ label: "Fields", value: "—" }]
      : v.fields.map((f) => ({
          label: f.label,
          value: `${f.type}${f.required ? " (required)" : ""}`,
        })),
});
