import Link from "next/link";
import { prisma } from "@/lib/db";
import type { TenantConfig } from "@/config/tenant-config-schema";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "asc" },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tenants</h1>
          <p className="text-sm text-muted-foreground">
            Each insurer is configured here — no code changes to onboard.
          </p>
        </div>
        <Link href="/tenants/new" className={buttonVariants()}>
          + New tenant
        </Link>
      </div>

      {tenants.length === 0 ? (
        <p className="text-muted-foreground">No tenants yet. Create one to start.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Claim types</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((t) => {
              const config = t.versions[0]?.config as unknown as
                | TenantConfig
                | undefined;
              const types = config?.claimTypes.enabledTypes ?? [];
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-muted-foreground">{t.slug}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {types.map((ct) => (
                        <Badge key={ct} variant="secondary">
                          {ct}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>v{t.currentVersion}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/tenants/${t.id}/edit`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/tenants/${t.id}/history`}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        History
                      </Link>
                      <Link
                        href={`/preview?tenant=${t.id}`}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        Preview
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
