import { REGISTRY } from "@/config/dimensions/registry";
import type { TenantConfig } from "@/config/tenant-config-schema";

export interface DiffRowResult {
  label: string;
  a: string | null;
  b: string | null;
  changed: boolean;
}

export interface DiffDimension {
  dimension: string;
  title: string;
  rows: DiffRowResult[];
}

/**
 * Compare two configs dimension-by-dimension using each dimension's
 * summarize(). Registry-driven: a new dimension appears in the diff with no
 * change here. Rows are aligned by label; a row is `changed` when the values
 * differ or a label exists on only one side.
 */
export function diffConfigs(a: TenantConfig, b: TenantConfig): DiffDimension[] {
  const av = a as Record<string, unknown>;
  const bv = b as Record<string, unknown>;

  return REGISTRY.map((d) => {
    const aRows = d.summarize(av[d.key]);
    const bRows = d.summarize(bv[d.key]);
    const aMap = new Map(aRows.map((r) => [r.label, r.value]));
    const bMap = new Map(bRows.map((r) => [r.label, r.value]));

    const labels: string[] = [];
    const seen = new Set<string>();
    for (const r of [...aRows, ...bRows]) {
      if (!seen.has(r.label)) {
        seen.add(r.label);
        labels.push(r.label);
      }
    }

    const rows = labels.map((label): DiffRowResult => {
      const aVal = aMap.has(label) ? aMap.get(label)! : null;
      const bVal = bMap.has(label) ? bMap.get(label)! : null;
      return { label, a: aVal, b: bVal, changed: aVal !== bVal };
    });

    return { dimension: d.key, title: d.title, rows };
  });
}

/** Total number of changed rows across all dimensions. */
export function countDifferences(diff: DiffDimension[]): number {
  return diff.reduce(
    (n, d) => n + d.rows.filter((r) => r.changed).length,
    0
  );
}
