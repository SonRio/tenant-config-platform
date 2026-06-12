"use client";

import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/field-error";
import { errorMessage } from "@/lib/form-utils";
import { useT } from "@/components/i18n-provider";
import { FIELD_TYPES } from "@/config/dimensions/shared";
import type { TenantFormValues } from "@/lib/tenant-form-schema";

function FieldRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const t = useT();
  const { register, control, formState } = useFormContext<TenantFormValues>();
  const type = useWatch({
    control,
    name: `config.customFields.fields.${index}.type` as never,
  }) as string;
  const base = `config.customFields.fields.${index}`;

  return (
    <div className="grid gap-3 rounded-xl border bg-muted/30 p-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("form.customFields.key")}
          </Label>
          <Input {...register(`${base}.key` as never)} placeholder="employeeId" />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("form.customFields.label")}
          </Label>
          <Input {...register(`${base}.label` as never)} placeholder="Employee ID" />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("form.customFields.type")}
          </Label>
          <Controller
            control={control}
            name={`${base}.type` as never}
            render={({ field }) => (
              <Select
                value={field.value as string}
                onValueChange={(v) => field.onChange(v ?? "")}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((ft) => (
                    <SelectItem key={ft} value={ft}>
                      {ft}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <Controller
            control={control}
            name={`${base}.required` as never}
            render={({ field }) => (
              <Checkbox
                checked={field.value === true}
                onCheckedChange={(c) => field.onChange(c === true)}
              />
            )}
          />
          {t("form.customFields.required")}
        </label>
      </div>

      {type === "select" && (
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("form.customFields.options")} · {t("form.onePerLine")}
          </Label>
          <Controller
            control={control}
            name={`${base}.options` as never}
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
          <FieldError message={errorMessage(formState.errors, `${base}.options`)} />
        </div>
      )}

      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          {t("form.customFields.removeField")}
        </Button>
      </div>
    </div>
  );
}

export function CustomFieldsSection() {
  const t = useT();
  const { control } = useFormContext<TenantFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "config.customFields.fields",
  });

  return (
    <div className="grid gap-3">
      {fields.map((f, i) => (
        <FieldRow key={f.id} index={i} onRemove={() => remove(i)} />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() =>
          append({ key: "", label: "", type: "text", required: false })
        }
      >
        + {t("form.customFields.addField")}
      </Button>
    </div>
  );
}
