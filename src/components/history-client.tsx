"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VersionRow {
  version: number;
  note: string | null;
  createdAt: string;
  isCurrent: boolean;
}

export function HistoryClient({ tenantId }: { tenantId: string }) {
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);
  const [viewedConfig, setViewedConfig] = useState<unknown>(null);

  const load = useCallback(() => {
    fetch(`/api/tenants/${tenantId}/versions`)
      .then((r) => r.json())
      .then(setVersions);
  }, [tenantId]);

  useEffect(load, [load]);

  const view = async (version: number) => {
    if (viewing === version) {
      setViewing(null);
      return;
    }
    const res = await fetch(`/api/tenants/${tenantId}/versions/${version}`);
    const data = await res.json();
    setViewedConfig(data.config);
    setViewing(version);
  };

  const rollback = async (version: number) => {
    if (!window.confirm(`Roll back to v${version}? This creates a new version.`)) {
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/tenants/${tenantId}/rollback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      toast.error(data.error ?? "Rollback failed");
      return;
    }
    toast.success(`Rolled back — created v${data.version}`);
    setViewing(null);
    load();
  };

  return (
    <div className="grid gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.map((v) => (
            <TableRow key={v.version}>
              <TableCell className="font-medium">
                v{v.version}{" "}
                {v.isCurrent && <Badge className="ml-1">current</Badge>}
              </TableCell>
              <TableCell className="text-muted-foreground">{v.note ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(v.createdAt).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => view(v.version)}>
                    {viewing === v.version ? "Hide" : "View"}
                  </Button>
                  {!v.isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => rollback(v.version)}
                    >
                      Rollback
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {viewing !== null && (
        <pre className="overflow-auto rounded-lg border bg-muted/40 p-4 text-xs">
          {JSON.stringify(viewedConfig, null, 2)}
        </pre>
      )}
    </div>
  );
}
