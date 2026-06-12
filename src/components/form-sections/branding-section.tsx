"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";
import { errorMessage } from "@/lib/form-utils";
import { useT } from "@/components/i18n-provider";
import type { TenantFormValues } from "@/lib/tenant-form-schema";

function ColorField({ path, label }: { path: string; label: string }) {
  const { control } = useFormContext<TenantFormValues>();
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={path as never}
        render={({ field }) => {
          const val = typeof field.value === "string" ? field.value : "";
          const valid = /^#[0-9a-fA-F]{6}$/.test(val);
          return (
            <div className="flex items-center gap-2">
              {/* Clickable native color picker, synced with the hex input. */}
              <input
                type="color"
                aria-label={label}
                value={valid ? val : "#000000"}
                onChange={(e) => field.onChange(e.target.value)}
                className="size-9 shrink-0 cursor-pointer rounded-lg border bg-transparent p-1 shadow-soft"
              />
              <Input
                value={val}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="#2563eb"
              />
            </div>
          );
        }}
      />
    </div>
  );
}

export function BrandingSection() {
  const t = useT();
  const {
    register,
    formState: { errors },
  } = useFormContext<TenantFormValues>();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label>{t("form.branding.companyName")}</Label>
        <Input {...register("config.branding.companyName")} />
        <FieldError message={errorMessage(errors, "config.branding.companyName")} />
      </div>
      <div className="grid gap-2">
        <Label>{t("form.branding.logoUrl")}</Label>
        <Input {...register("config.branding.logoUrl")} placeholder="https://…" />
        <FieldError message={errorMessage(errors, "config.branding.logoUrl")} />
      </div>
      <div>
        <ColorField
          path="config.branding.primaryColor"
          label={t("form.branding.primaryColor")}
        />
        <FieldError message={errorMessage(errors, "config.branding.primaryColor")} />
      </div>
      <div>
        <ColorField
          path="config.branding.secondaryColor"
          label={t("form.branding.secondaryColor")}
        />
        <FieldError message={errorMessage(errors, "config.branding.secondaryColor")} />
      </div>
    </div>
  );
}
