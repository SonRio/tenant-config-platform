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
import { useT } from "@/components/i18n-provider";
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  tenants: TenantListItem[];
  placeholder: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
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
  const t = useT();
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

  const changedDims = diff?.filter((d) => d.rows.some((r) => r.changed)).length ?? 0;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TenantSelect
          label={t("diff.tenantA")}
          value={a}
          onChange={setA}
          tenants={tenants}
          placeholder={t("preview.chooseTenant")}
        />
        <TenantSelect
          label={t("diff.tenantB")}
          value={b}
          onChange={setB}
          tenants={tenants}
          placeholder={t("preview.chooseTenant")}
        />
      </div>

      {diff && (
        <>
          <p className="text-sm text-muted-foreground">
            {t("diff.summary", { count: total, dims: changedDims })}
          </p>
          <div className="grid gap-4">
            {diff.map((dim) => (
              <Card key={dim.dimension}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t(`dimensions.${dim.dimension}`)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-1">
                  {dim.rows.map((row) => (
                    <div
                      key={row.label}
                      className={cn(
                        "grid grid-cols-[1fr_1fr_1fr] gap-2 rounded-lg px-2 py-1.5 text-sm",
                        row.changed && "bg-amber-400/15 ring-1 ring-amber-400/30"
                      )}
                    >
                      <span className="text-muted-foreground">{row.label}</span>
                      <span>
                        {row.a ?? <Badge variant="outline">{t("common.absent")}</Badge>}
                      </span>
                      <span>
                        {row.b ?? <Badge variant="outline">{t("common.absent")}</Badge>}
                      </span>
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
