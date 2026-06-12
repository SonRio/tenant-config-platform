import type { ZodType } from "zod";

/**
 * A single flat fact about a config slice, used for both the diff view and the
 * preview summary. Keeping summaries flat (label + string value) makes diffing
 * and rendering trivial and dimension-agnostic.
 */
export type DiffRow = { label: string; value: string };

/**
 * A config dimension is a self-describing module: its validation schema, the
 * seed value for new tenants, and how to flatten its value for display.
 *
 * The contract is intentionally React-free so the registry can be imported by
 * pure runtime code (processClaim), API routes, and tests without dragging in
 * client components. The admin form layer maps dimension keys to form sections
 * separately (see src/components/form-sections).
 */
export interface ConfigDimension<T = unknown> {
  /** Unique key — also the property name inside TenantConfig. */
  key: string;
  /** Human-readable section heading. */
  title: string;
  /** Zod schema validating this slice of the config. */
  schema: ZodType<T>;
  /** Seed value for a brand-new tenant (must itself be valid). */
  default: T;
  /**
   * Flatten a value into rows for diff + preview display.
   * Declared as a method (not an arrow property) so a specific
   * `ConfigDimension<T>` stays assignable to `ConfigDimension<unknown>` in the
   * heterogeneous registry array.
   */
  summarize(value: T): DiffRow[];
}

/** Identity helper that preserves per-dimension generic typing. */
export function defineDimension<T>(d: ConfigDimension<T>): ConfigDimension<T> {
  return d;
}
