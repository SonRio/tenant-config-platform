import { z } from "zod";
import { defineDimension } from "./types";

const tierSchema = z.object({
  minAmount: z.number().min(0, "Min must be ≥ 0"),
  // null = unbounded (only allowed on the last/highest tier).
  maxAmount: z.number().min(0).nullable(),
  approverRole: z.string().min(1, "Approver role is required"),
});

export const approvalSchema = z
  .object({
    autoApprovalThreshold: z.number().min(0, "Threshold must be ≥ 0"),
    tiers: z.array(tierSchema).min(1, "At least one approval tier"),
  })
  .superRefine((val, ctx) => {
    // Tiers must start at 0, be sorted, non-overlapping, contiguous, and the
    // last one unbounded — so every amount ≥ 0 routes to exactly one tier and
    // nothing can fall through unrouted.
    const tiers = val.tiers;
    if (tiers.length > 0 && tiers[0].minAmount !== 0) {
      ctx.addIssue({
        code: "custom",
        message: "First tier must start at 0",
        path: ["tiers", 0, "minAmount"],
      });
    }
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      if (t.maxAmount !== null && t.maxAmount <= t.minAmount) {
        ctx.addIssue({
          code: "custom",
          message: `Tier ${i + 1}: max must be greater than min`,
          path: ["tiers", i, "maxAmount"],
        });
      }
      if (i > 0) {
        const prev = tiers[i - 1];
        if (prev.maxAmount === null) {
          ctx.addIssue({
            code: "custom",
            message: `Only the last tier may be unbounded`,
            path: ["tiers", i - 1, "maxAmount"],
          });
        } else if (t.minAmount !== prev.maxAmount) {
          ctx.addIssue({
            code: "custom",
            message: `Tier ${i + 1} must start at ${prev.maxAmount} (no gap/overlap)`,
            path: ["tiers", i, "minAmount"],
          });
        }
      }
    }
    if (tiers.length > 0 && tiers[tiers.length - 1].maxAmount !== null) {
      ctx.addIssue({
        code: "custom",
        message: "The last tier must be unbounded (no max) to cover all amounts",
        path: ["tiers", tiers.length - 1, "maxAmount"],
      });
    }
  });

export type ApprovalConfig = z.infer<typeof approvalSchema>;

export const approval = defineDimension<ApprovalConfig>({
  key: "approval",
  title: "Approval Rules",
  schema: approvalSchema,
  default: {
    autoApprovalThreshold: 0,
    tiers: [{ minAmount: 0, maxAmount: null, approverRole: "Manager" }],
  },
  summarize: (v) => [
    { label: "Auto-approval threshold", value: String(v.autoApprovalThreshold) },
    ...v.tiers.map((t, i) => ({
      label: `Tier ${i + 1}`,
      value: `${t.minAmount}–${t.maxAmount ?? "∞"} → ${t.approverRole}`,
    })),
  ],
});
