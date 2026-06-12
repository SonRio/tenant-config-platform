import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getActiveConfig } from "@/lib/config-versions";
import { TenantForm } from "@/components/tenant-form";
import { PageHeading } from "@/components/page-heading";
import type { TenantFormValues } from "@/lib/tenant-form-schema";

export const dynamic = "force-dynamic";

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) notFound();

  const config = await getActiveConfig(id);
  if (!config) notFound();

  const defaultValues: TenantFormValues = {
    name: tenant.name,
    slug: tenant.slug,
    config,
  };

  return (
    <div className="grid gap-6">
      <PageHeading
        titleKey="form.editTitle"
        subtitleKey="form.editHint"
        vars={{ name: tenant.name, version: tenant.currentVersion }}
      />
      <TenantForm tenantId={id} defaultValues={defaultValues} />
    </div>
  );
}
