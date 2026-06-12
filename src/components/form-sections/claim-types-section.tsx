"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/field-error";
import { errorMessage } from "@/lib/form-utils";
import { useT } from "@/components/i18n-provider";
import { CLAIM_TYPES, type ClaimType } from "@/config/dimensions/shared";
import type { TenantFormValues } from "@/lib/tenant-form-schema";

function DocList({ path, label }: { path: string; label: string }) {
  const t = useT();
  const { control } = useFormContext<TenantFormValues>();
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">
        {label} · {t("form.onePerLine")}
      </Label>
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
  const t = useT();
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
        cur.filter((t2) => t2 !== type),
        { shouldValidate: true }
      );
      setValue(`config.sla.perType.${type}` as never, undefined as never);
      setValue(`config.claimTypes.docs.${type}` as never, undefined as never);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {CLAIM_TYPES.map((type) => {
          const on = enabled.includes(type);
          return (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors data-[on=true]:border-brand/50 data-[on=true]:bg-secondary"
              data-on={on}
            >
              <Checkbox
                checked={on}
                onCheckedChange={(c) => toggle(type, c === true)}
              />
              {type}
            </label>
          );
        })}
      </div>
      <FieldError
        message={errorMessage(formState.errors, "config.claimTypes.enabledTypes")}
      />

      {enabled.length > 0 && (
        <div className="grid gap-4">
          {enabled.map((type) => (
            <div key={type} className="rounded-xl border bg-muted/30 p-3">
              <Badge variant="secondary" className="mb-2">
                {type}
              </Badge>
              <div className="grid gap-3 sm:grid-cols-2">
                <DocList
                  path={`config.claimTypes.docs.${type}.requiredDocs`}
                  label={t("form.claimTypes.requiredDocs")}
                />
                <DocList
                  path={`config.claimTypes.docs.${type}.optionalDocs`}
                  label={t("form.claimTypes.optionalDocs")}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
