import { z } from "zod";

/** Claim types the platform understands. Tenants enable a subset. */
export const CLAIM_TYPES = [
  "OUTPATIENT",
  "INPATIENT",
  "DENTAL",
  "MATERNITY",
  "OPTICAL",
] as const;
export const claimTypeSchema = z.enum(CLAIM_TYPES);
export type ClaimType = (typeof CLAIM_TYPES)[number];

/** Notification delivery channels. */
export const CHANNELS = ["email", "sms", "webhook"] as const;
export const channelSchema = z.enum(CHANNELS);
export type Channel = (typeof CHANNELS)[number];

/** Lifecycle events that can trigger notifications. */
export const NOTIFY_EVENTS = [
  "claim_submitted",
  "claim_approved",
  "claim_rejected",
  "payment_sent",
] as const;
export const notifyEventSchema = z.enum(NOTIFY_EVENTS);
export type NotifyEvent = (typeof NOTIFY_EVENTS)[number];

/** Custom-field input types. */
export const FIELD_TYPES = ["text", "number", "select"] as const;
export const fieldTypeSchema = z.enum(FIELD_TYPES);
export type FieldType = (typeof FIELD_TYPES)[number];

/** A hex color like #1a2b3c. */
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color, e.g. #2563eb");
