import { PrismaClient } from "@prisma/client";
import { tenantConfigSchema } from "../src/config/tenant-config-schema";
import { SEED_TENANTS } from "../src/config/seed-tenants";

const prisma = new PrismaClient();

async function main() {
  for (const seed of SEED_TENANTS) {
    // Validate before insert so a malformed seed fails loudly here, not at runtime.
    const config = tenantConfigSchema.parse(seed.config);

    await prisma.tenant.upsert({
      where: { slug: seed.slug },
      update: {}, // leave existing tenants untouched on re-seed
      create: {
        slug: seed.slug,
        name: seed.name,
        currentVersion: 1,
        versions: {
          create: { version: 1, config, note: "created (seed)" },
        },
      },
    });
    console.log(`seeded ${seed.slug}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
