"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";
import { errorMessage } from "@/lib/form-utils";
import type { TenantFormValues } from "@/lib/tenant-form-schema";

function ColorField({ path, label }: { path: string; label: string }) {
  const { register, control } = useFormContext<TenantFormValues>();
  const value = useWatch({ control, name: path as never }) as string;
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <span
          className="size-8 shrink-0 rounded-md border"
          style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(value) ? value : "transparent" }}
        />
        <Input {...register(path as never)} placeholder="#2563eb" />
      </div>
    </div>
  );
}

export function BrandingSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<TenantFormValues>();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label>Company name</Label>
        <Input {...register("config.branding.companyName")} />
        <FieldError message={errorMessage(errors, "config.branding.companyName")} />
      </div>
      <div className="grid gap-2">
        <Label>Logo URL (optional)</Label>
        <Input {...register("config.branding.logoUrl")} placeholder="https://…" />
        <FieldError message={errorMessage(errors, "config.branding.logoUrl")} />
      </div>
      <div>
        <ColorField path="config.branding.primaryColor" label="Primary color" />
        <FieldError message={errorMessage(errors, "config.branding.primaryColor")} />
      </div>
      <div>
        <ColorField path="config.branding.secondaryColor" label="Secondary color" />
        <FieldError message={errorMessage(errors, "config.branding.secondaryColor")} />
      </div>
    </div>
  );
}
