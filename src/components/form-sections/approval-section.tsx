"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/field-error";
import { errorMessage } from "@/lib/form-utils";
import { useT } from "@/components/i18n-provider";
import type { TenantFormValues } from "@/lib/tenant-form-schema";

export function ApprovalSection() {
  const t = useT();
  const { register, control, formState } = useFormContext<TenantFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "config.approval.tiers",
  });

  return (
    <div className="grid gap-4">
      <div className="grid max-w-xs gap-2">
        <Label>{t("form.approval.threshold")}</Label>
        <Input
          type="number"
          {...register("config.approval.autoApprovalThreshold", {
            valueAsNumber: true,
          })}
        />
        <p className="text-xs text-muted-foreground">
          {t("form.approval.thresholdHint")}
        </p>
        <FieldError
          message={errorMessage(
            formState.errors,
            "config.approval.autoApprovalThreshold"
          )}
        />
      </div>

      <div className="grid gap-3">
        <Label>{t("form.approval.tiers")}</Label>
        {fields.map((f, i) => (
          <div key={f.id} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_1.5fr_auto]">
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("form.approval.minAmount")}
              </Label>
              <Input
                type="number"
                {...register(`config.approval.tiers.${i}.minAmount` as never, {
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("form.approval.maxAmount")}
              </Label>
              <Controller
                control={control}
                name={`config.approval.tiers.${i}.maxAmount` as never}
                render={({ field }) => {
                  const unbounded = field.value === null;
                  return (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        disabled={unbounded}
                        value={unbounded ? "" : (field.value as number)}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                      />
                      <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                        <Checkbox
                          checked={unbounded}
                          onCheckedChange={(c) => field.onChange(c === true ? null : 0)}
                        />
                        ∞
                      </label>
                    </div>
                  );
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("form.approval.approverRole")}
              </Label>
              <Input
                {...register(`config.approval.tiers.${i}.approverRole` as never)}
              />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
              {t("common.remove")}
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() =>
            append({ minAmount: 0, maxAmount: null, approverRole: "" })
          }
        >
          + {t("form.approval.addTier")}
        </Button>
        <FieldError
          message={errorMessage(formState.errors, "config.approval.tiers")}
        />
      </div>
    </div>
  );
}
