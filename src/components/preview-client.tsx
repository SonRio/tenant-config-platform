"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProcessResultView } from "@/components/process-result-view";
import type { TenantConfig } from "@/config/tenant-config-schema";
import type { ClaimData, ProcessResult } from "@/runtime/types";
import type { ClaimType } from "@/config/dimensions/shared";

interface TenantListItem {
  id: string;
  name: string;
}

export function PreviewClient({ initialTenantId }: { initialTenantId: string | null }) {
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [tenantId, setTenantId] = useState(initialTenantId ?? "");
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [claimType, setClaimType] = useState("");
  const [amount, setAmount] = useState("10000");
  const [submittedAt, setSubmittedAt] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/tenants")
      .then((r) => r.json())
      .then(setTenants)
      .catch(() => toast.error("Failed to load tenants"));
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    fetch(`/api/tenants/${tenantId}`)
      .then((r) => r.json())
      .then((d) => {
        const cfg = d.config as TenantConfig;
        setConfig(cfg);
        setClaimType(cfg?.claimTypes.enabledTypes[0] ?? "");
        setCustomValues({});
        setResult(null);
      });
  }, [tenantId]);

  const enabledTypes = config?.claimTypes.enabledTypes ?? [];
  const customFields = config?.customFields.fields ?? [];

  const run = async () => {
    setLoading(true);
    const claim: ClaimData = {
      claimType: claimType as ClaimType,
      amount: Number(amount),
      submittedAt,
      customFields: Object.fromEntries(
        customFields.map((f) => {
          const raw = customValues[f.key] ?? "";
          return [f.key, f.type === "number" ? Number(raw) : raw];
        })
      ),
    };
    const res = await fetch("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, claim }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Preview failed");
      return;
    }
    setResult(data);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Sample claim</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Tenant</Label>
            <Select value={tenantId} onValueChange={(v) => setTenantId(v ?? "")}>
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

          {config && (
            <>
              <div className="grid gap-2">
                <Label>Claim type</Label>
                <Select value={claimType} onValueChange={(v) => setClaimType(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Claim type" />
                  </SelectTrigger>
                  <SelectContent>
                    {enabledTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Submitted at</Label>
                <Input
                  type="date"
                  value={submittedAt}
                  onChange={(e) => setSubmittedAt(e.target.value)}
                />
              </div>

              {customFields.map((f) => (
                <div key={f.key} className="grid gap-2">
                  <Label>
                    {f.label}
                    {f.required && <span className="text-destructive"> *</span>}
                  </Label>
                  {f.type === "select" ? (
                    <Select
                      value={customValues[f.key] ?? ""}
                      onValueChange={(v) =>
                        setCustomValues((s) => ({ ...s, [f.key]: v ?? "" }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Choose ${f.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {(f.options ?? []).map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : "text"}
                      value={customValues[f.key] ?? ""}
                      onChange={(e) =>
                        setCustomValues((s) => ({ ...s, [f.key]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))}

              <Button onClick={run} disabled={loading || !claimType}>
                {loading ? "Running…" : "Run preview"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outcome</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <ProcessResultView result={result} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Pick a tenant and run a sample claim. This calls the exact same
              processClaim the runtime uses.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
