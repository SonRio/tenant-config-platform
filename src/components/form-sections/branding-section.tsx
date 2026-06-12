"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";
import { errorMessage } from "@/lib/form-utils";
import { useT } from "@/components/i18n-provider";
import type { TenantFormValues } from "@/lib/tenant-form-schema";

function ColorField({ path, label }: { path: string; label: string }) {
  const { register, control } = useFormContext<TenantFormValues>();
  const value = useWatch({ control, name: path as never }) as string;
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <span
          className="size-9 shrink-0 rounded-lg border shadow-soft"
          style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(value) ? value : "transparent" }}
        />
        <Input {...register(path as never)} placeholder="#2563eb" />
      </div>
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
