"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";
import { errorMessage } from "@/lib/form-utils";
import type { ClaimType } from "@/config/dimensions/shared";
import type { TenantFormValues } from "@/lib/tenant-form-schema";

export function SlaSection() {
  const { register, control, formState } = useFormContext<TenantFormValues>();
  const enabled =
    (useWatch({ control, name: "config.claimTypes.enabledTypes" }) as ClaimType[]) ??
    [];

  return (
    <div className="grid gap-4">
      {enabled.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Enable claim types first — each needs an SLA.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {enabled.map((type) => (
            <div key={type} className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">
                {type} — business days
              </Label>
              <Input
                type="number"
                min={1}
                {...register(`config.sla.perType.${type}` as never, {
                  valueAsNumber: true,
                })}
              />
              <FieldError
                message={errorMessage(
                  formState.errors,
                  `config.sla.perType.${type}`
                )}
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid max-w-xs gap-2">
        <Label>Escalation role</Label>
        <Input {...register("config.sla.escalation.notifyRole")} />
        <FieldError
          message={errorMessage(
            formState.errors,
            "config.sla.escalation.notifyRole"
          )}
        />
      </div>
    </div>
  );
}
