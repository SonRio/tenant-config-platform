"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/field-error";
import { errorMessage } from "@/lib/form-utils";
import { CLAIM_TYPES, type ClaimType } from "@/config/dimensions/shared";
import type { TenantFormValues } from "@/lib/tenant-form-schema";

function DocList({ path, label }: { path: string; label: string }) {
  const { control } = useFormContext<TenantFormValues>();
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label} (one per line)</Label>
      <Controller
        control={control}
        name={path as never}
        render={({ field }) => {
          const list = (field.value as string[] | undefined) ?? [];
          return (
            <Textarea
              rows={3}
              value={list.join("\n")}
              onChange={(e) =>
                field.onChange(
                  e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
                )
              }
            />
          );
        }}
      />
    </div>
  );
}

export function ClaimTypesSection() {
  const { control, getValues, setValue, formState } =
    useFormContext<TenantFormValues>();
  const enabled =
    (useWatch({ control, name: "config.claimTypes.enabledTypes" }) as ClaimType[]) ??
    [];

  const toggle = (type: ClaimType, on: boolean) => {
    const cur =
      (getValues("config.claimTypes.enabledTypes") as ClaimType[]) ?? [];
    if (on) {
      setValue("config.claimTypes.enabledTypes", [...new Set([...cur, type])], {
        shouldValidate: true,
      });
      if (getValues(`config.sla.perType.${type}` as never) === undefined) {
        setValue(`config.sla.perType.${type}` as never, 7 as never);
      }
      if (getValues(`config.claimTypes.docs.${type}` as never) === undefined) {
        setValue(`config.claimTypes.docs.${type}` as never, {
          requiredDocs: [],
          optionalDocs: [],
        } as never);
      }
    } else {
      setValue(
        "config.claimTypes.enabledTypes",
        cur.filter((t) => t !== type),
        { shouldValidate: true }
      );
      setValue(`config.sla.perType.${type}` as never, undefined as never);
      setValue(`config.claimTypes.docs.${type}` as never, undefined as never);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        {CLAIM_TYPES.map((type) => (
          <label key={type} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={enabled.includes(type)}
              onCheckedChange={(c) => toggle(type, c === true)}
            />
            {type}
          </label>
        ))}
      </div>
      <FieldError
        message={errorMessage(formState.errors, "config.claimTypes.enabledTypes")}
      />

      {enabled.length > 0 && (
        <div className="grid gap-4">
          {enabled.map((type) => (
            <div key={type} className="rounded-lg border p-3">
              <Badge variant="secondary" className="mb-2">
                {type}
              </Badge>
              <div className="grid gap-3 sm:grid-cols-2">
                <DocList
                  path={`config.claimTypes.docs.${type}.requiredDocs`}
                  label="Required documents"
                />
                <DocList
                  path={`config.claimTypes.docs.${type}.optionalDocs`}
                  label="Optional documents"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
