import { PrismaClient } from "@prisma/client";
import { processClaim } from "@/runtime/process-claim";
import { diffConfigs, countDifferences } from "@/lib/diff";
import type { TenantConfig } from "@/config/tenant-config-schema";
import type { ClaimData } from "@/runtime/types";

const prisma = new PrismaClient();

async function activeConfig(slug: string) {
  const t = await prisma.tenant.findUnique({
    where: { slug },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (!t) throw new Error(`Tenant ${slug} not found — run npm run db:seed`);
  return { id: t.id, name: t.name, config: t.versions[0].config as unknown as TenantConfig };
}

async function main() {
  const slugs = ["safeguard", "healthfirst", "govhealth"];
  const tenants = await Promise.all(slugs.map(activeConfig));

  // 1. Same claim → three tenants → three outcomes.
  const claim: ClaimData = {
    claimType: "INPATIENT",
    amount: 50000,
    submittedAt: "2026-06-12",
  };
  console.log("\n=== Same claim, three tenants ===");
  console.log("Claim:", JSON.stringify(claim), "\n");

  const signatures = new Set<string>();
  for (const t of tenants) {
    const r = processClaim(t.config, claim);
    const approval = r.approval.autoApproved
      ? "auto-approved"
      : `tier ${r.approval.tier} → ${r.approval.approverRole}`;
    const channels = r.notifications.flatMap((n) => n.channels);
    console.log(`${t.name}`);
    console.log(`  approval:      ${approval}`);
    console.log(`  SLA deadline:  ${r.slaDeadline}`);
    console.log(`  notifications: ${channels.join(", ") || "—"}`);
    signatures.add(`${approval}|${r.slaDeadline}|${channels.sort().join(",")}`);
  }
  console.log(
    `\n${signatures.size === tenants.length ? "✓" : "✗"} ${signatures.size} distinct outcomes for ${tenants.length} tenants`
  );

  // 2. Config diff between two tenants.
  const diff = diffConfigs(tenants[0].config, tenants[2].config);
  console.log(
    `\n=== Diff: ${tenants[0].name} vs ${tenants[2].name} ===`
  );
  console.log(`${countDifferences(diff)} differences across dimensions.`);

  // 3. Version history of one tenant.
  const versions = await prisma.configVersion.findMany({
    where: { tenant: { slug: "safeguard" } },
    orderBy: { version: "desc" },
    select: { version: true, note: true },
  });
  console.log(`\n=== ${tenants[0].name} version history ===`);
  for (const v of versions) console.log(`  v${v.version}: ${v.note}`);
  console.log();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
