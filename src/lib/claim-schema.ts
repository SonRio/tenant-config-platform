import { z } from "zod";
import { claimTypeSchema } from "@/config/dimensions/shared";

/** Validates the claim payload submitted to Preview. */
export const claimDataSchema = z.object({
  claimType: claimTypeSchema,
  amount: z.number().min(0, "Amount must be ≥ 0"),
  submittedAt: z.string().min(1, "Submission date is required"),
  customFields: z
    .record(z.string(), z.union([z.string(), z.number()]))
    .optional(),
});

export type ClaimDataInput = z.infer<typeof claimDataSchema>;
