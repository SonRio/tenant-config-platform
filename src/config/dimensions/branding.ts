import { z } from "zod";
import { defineDimension } from "./types";
import { hexColorSchema } from "./shared";

export const brandingSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  logoUrl: z
    .string()
    .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "Must be a URL")
    .optional()
    .default(""),
  primaryColor: hexColorSchema,
  secondaryColor: hexColorSchema,
});

export type Branding = z.infer<typeof brandingSchema>;

export const branding = defineDimension<Branding>({
  key: "branding",
  title: "Branding",
  schema: brandingSchema,
  default: {
    companyName: "New Tenant",
    logoUrl: "",
    primaryColor: "#2563eb",
    secondaryColor: "#1e293b",
  },
  summarize: (v) => [
    { label: "Company name", value: v.companyName || "—" },
    { label: "Primary color", value: v.primaryColor },
    { label: "Secondary color", value: v.secondaryColor },
    { label: "Logo URL", value: v.logoUrl || "—" },
  ],
});
