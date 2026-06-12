"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useT } from "@/components/i18n-provider";

interface VersionRow {
  version: number;
  note: string | null;
  createdAt: string;
  isCurrent: boolean;
}

export function HistoryClient({ tenantId }: { tenantId: string }) {
  const t = useT();
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
    if (!window.confirm(t("history.confirmRollback", { version }))) return;
    setBusy(true);
    const res = await fetch(`/api/tenants/${tenantId}/rollback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      toast.error(data.error ?? t("history.rollbackFailed"));
      return;
    }
    toast.success(t("history.rolledBack", { version: data.version }));
    setViewing(null);
    load();
  };

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Link
          href={`/tenants/${tenantId}/edit`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {t("common.edit")}
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("history.version")}</TableHead>
            <TableHead>{t("history.note")}</TableHead>
            <TableHead>{t("history.created")}</TableHead>
            <TableHead className="text-right" aria-label="actions" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.map((v) => (
            <TableRow key={v.version}>
              <TableCell className="font-medium tabular-nums">
                v{v.version}{" "}
                {v.isCurrent && <Badge className="ml-1">{t("common.current")}</Badge>}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {v.note ?? t("common.none")}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(v.createdAt).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => view(v.version)}>
                    {viewing === v.version ? t("common.hide") : t("common.view")}
                  </Button>
                  {!v.isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => rollback(v.version)}
                    >
                      {t("common.rollback")}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {viewing !== null && (
        <pre className="overflow-auto rounded-xl border bg-muted/40 p-4 text-xs">
          {JSON.stringify(viewedConfig, null, 2)}
        </pre>
      )}
    </div>
  );
}
