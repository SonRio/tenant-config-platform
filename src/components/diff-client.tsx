"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DiffDimension } from "@/lib/diff";

interface TenantListItem {
  id: string;
  name: string;
}

function TenantSelect({
  label,
  value,
  onChange,
  tenants,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  tenants: TenantListItem[];
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a tenant" />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function DiffClient() {
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [diff, setDiff] = useState<DiffDimension[] | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/tenants")
      .then((r) => r.json())
      .then(setTenants);
  }, []);

  useEffect(() => {
    if (!a || !b) return;
    fetch(`/api/diff?a=${a}&b=${b}`)
      .then((r) => r.json())
      .then((d) => {
        setDiff(d.diff);
        setTotal(d.total);
      });
  }, [a, b]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TenantSelect label="Tenant A" value={a} onChange={setA} tenants={tenants} />
        <TenantSelect label="Tenant B" value={b} onChange={setB} tenants={tenants} />
      </div>

      {diff && (
        <>
          <p className="text-sm text-muted-foreground">
            {total} difference{total === 1 ? "" : "s"} across{" "}
            {diff.filter((d) => d.rows.some((r) => r.changed)).length} dimension(s).
          </p>
          <div className="grid gap-4">
            {diff.map((dim) => (
              <Card key={dim.dimension}>
                <CardHeader>
                  <CardTitle className="text-base">{dim.title}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-1">
                  {dim.rows.map((row) => (
                    <div
                      key={row.label}
                      className={cn(
                        "grid grid-cols-[1fr_1fr_1fr] gap-2 rounded px-2 py-1 text-sm",
                        row.changed && "bg-amber-100 dark:bg-amber-950/40"
                      )}
                    >
                      <span className="text-muted-foreground">{row.label}</span>
                      <span>{row.a ?? <Badge variant="outline">absent</Badge>}</span>
                      <span>{row.b ?? <Badge variant="outline">absent</Badge>}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
