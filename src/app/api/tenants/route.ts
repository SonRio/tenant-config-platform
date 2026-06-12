import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { tenantFormSchema } from "@/lib/tenant-form-schema";
import type { TenantConfig } from "@/config/tenant-config-schema";

export async function GET() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "asc" },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });

  const list = tenants.map((t) => {
    const config = t.versions[0]?.config as unknown as TenantConfig | undefined;
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      currentVersion: t.currentVersion,
      enabledTypes: config?.claimTypes.enabledTypes ?? [],
    };
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = tenantFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid config", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name, slug, config } = parsed.data;

  try {
    const exists = await prisma.tenant.findUnique({ where: { slug } });
    if (exists) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        currentVersion: 1,
        versions: {
          create: {
            version: 1,
            config: config as unknown as Prisma.InputJsonValue,
            note: "created",
          },
        },
      },
    });
    return NextResponse.json(tenant, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create tenant" }, { status: 500 });
  }
}
