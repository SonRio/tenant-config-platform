"use client";

import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { REGISTRY } from "@/config/dimensions/registry";
import { FORM_SECTIONS } from "@/components/form-sections";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/field-error";
import { errorMessage } from "@/lib/form-utils";
import { tenantFormSchema, type TenantFormValues } from "@/lib/tenant-form-schema";
import { defaultConfig } from "@/config/tenant-config-schema";

interface TenantFormProps {
  tenantId?: string;
  defaultValues?: TenantFormValues;
}

export function TenantForm({ tenantId, defaultValues }: TenantFormProps) {
  const router = useRouter();
  const isEdit = Boolean(tenantId);

  const methods = useForm<TenantFormValues>({
    // Cast bridges Zod's input/output divergence (fields with .default()) and
    // useForm's single output generic.
    resolver: zodResolver(tenantFormSchema) as unknown as Resolver<TenantFormValues>,
    defaultValues: defaultValues ?? {
      name: "",
      slug: "",
      config: defaultConfig(),
    },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onValid = async (values: TenantFormValues) => {
    const res = await fetch(
      isEdit ? `/api/tenants/${tenantId}` : "/api/tenants",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Save failed");
      return;
    }
    toast.success(isEdit ? "Tenant updated" : "Tenant created");
    router.push("/");
    router.refresh();
  };

  const onInvalid = () => toast.error("Please fix the highlighted errors");

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tenant</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="MediCare Plus" />
              <FieldError message={errorMessage(errors, "name")} />
            </div>
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input
                {...register("slug")}
                placeholder="medicare-plus"
                disabled={isEdit}
              />
              <FieldError message={errorMessage(errors, "slug")} />
            </div>
          </CardContent>
        </Card>

        {REGISTRY.map((d) => {
          const Section = FORM_SECTIONS[d.key];
          if (!Section) return null;
          return (
            <Card key={d.key}>
              <CardHeader>
                <CardTitle>{d.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Section />
              </CardContent>
            </Card>
          );
        })}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isEdit ? "Save new version" : "Create tenant"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/")}>
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
