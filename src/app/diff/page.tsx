import { DiffClient } from "@/components/diff-client";

export default function DiffPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Config diff</h1>
        <p className="text-sm text-muted-foreground">
          Compare two tenants side by side. Differences are highlighted.
        </p>
      </div>
      <DiffClient />
    </div>
  );
}
