import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import type { TenantConfig } from "@/config/tenant-config-schema";
import { processClaim } from "@/runtime/process-claim";
import type { ClaimData, ProcessResult } from "@/runtime/types";

/**
 * Insert a new immutable config version and advance the tenant's pointer, in a
 * single transaction. The one place versions are written — reused by create,
 * edit, and rollback.
 */
export async function saveNewVersion(
  tenantId: string,
  config: TenantConfig,
  note: string
) {
  // The next version is computed as MAX(version)+1; concurrent saves could pick
  // the same number and collide on @@unique([tenantId, version]). Retry a few
  // times on that unique violation (P2002) so the loser simply recomputes.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const agg = await tx.configVersion.aggregate({
          where: { tenantId },
          _max: { version: true },
        });
        const nextVersion = (agg._max.version ?? 0) + 1;

        const created = await tx.configVersion.create({
          data: {
            tenantId,
            version: nextVersion,
            config: config as unknown as Prisma.InputJsonValue,
            note,
          },
        });
        await tx.tenant.update({
          where: { id: tenantId },
          data: { currentVersion: nextVersion },
        });
        return created;
      });
    } catch (e) {
      const isVersionCollision =
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
      if (!isVersionCollision || attempt === 2) throw e;
    }
  }
  throw new Error("Failed to allocate a config version");
}

/** The tenant's currently active config, or null if tenant/version missing. */
export async function getActiveConfig(
  tenantId: string
): Promise<TenantConfig | null> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return null;

  const version = await prisma.configVersion.findUnique({
    where: {
      tenantId_version: { tenantId, version: tenant.currentVersion },
    },
  });
  if (!version) return null;
  // Policy: configs are validated on every write (create/edit/rollback), so the
  // active config is trusted on read for performance. Rollback re-validates
  // because a historical config may predate a schema change.
  return version.config as unknown as TenantConfig;
}

/** Load a tenant's active config and run the pure processClaim against it. */
export async function processClaimById(
  tenantId: string,
  claim: ClaimData
): Promise<ProcessResult | null> {
  const config = await getActiveConfig(tenantId);
  if (!config) return null;
  return processClaim(config, claim);
}
