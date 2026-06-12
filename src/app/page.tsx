import { prisma } from "@/lib/db";
import type { TenantConfig } from "@/config/tenant-config-schema";
import { TenantsView, type TenantCard } from "@/components/tenants-view";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const rows = await prisma.tenant.findMany({
    orderBy: { createdAt: "asc" },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });

  const tenants: TenantCard[] = rows.map((t) => {
    const config = t.versions[0]?.config as unknown as TenantConfig | undefined;
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      currentVersion: t.currentVersion,
      enabledTypes: config?.claimTypes.enabledTypes ?? [],
      primaryColor: config?.branding.primaryColor ?? "#0d9488",
    };
  });

  const distinctTypes = new Set(tenants.flatMap((t) => t.enabledTypes));
  const stats = {
    tenants: tenants.length,
    claimTypes: distinctTypes.size,
    versions: tenants.reduce((n, t) => n + t.currentVersion, 0),
  };

  return <TenantsView tenants={tenants} stats={stats} />;
}
