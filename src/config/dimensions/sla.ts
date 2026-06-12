import { z } from "zod";
import { defineDimension } from "./types";
import { claimTypeSchema } from "./shared";

export const slaSchema = z.object({
  // Business days to resolution, per claim type. Must be > 0.
  perType: z
    .partialRecord(claimTypeSchema, z.number().int().positive("SLA must be > 0"))
    .default({}),
  escalation: z.object({
    notifyRole: z.string().min(1, "Escalation role is required"),
  }),
});

export type SlaConfig = z.infer<typeof slaSchema>;

export const sla = defineDimension<SlaConfig>({
  key: "sla",
  title: "SLA",
  schema: slaSchema,
  default: {
    perType: { OUTPATIENT: 7 },
    escalation: { notifyRole: "Supervisor" },
  },
  summarize: (v) => [
    ...Object.entries(v.perType).map(([type, days]) => ({
      label: `${type} SLA`,
      value: `${days} business day(s)`,
    })),
    { label: "Escalation role", value: v.escalation.notifyRole },
  ],
});
