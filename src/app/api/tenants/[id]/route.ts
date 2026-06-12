import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveConfig, saveNewVersion } from "@/lib/config-versions";
import { tenantConfigSchema } from "@/config/tenant-config-schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }
  const config = await getActiveConfig(id);
  return NextResponse.json({ ...tenant, config });
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  // Server-side validation (defense in depth — client already validated).
  const parsed = tenantConfigSchema.safeParse(body?.config);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid config", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    if (typeof body?.name === "string" && body.name !== tenant.name) {
      await prisma.tenant.update({ where: { id }, data: { name: body.name } });
    }
    const version = await saveNewVersion(id, parsed.data, "edit");
    return NextResponse.json({ ok: true, version: version.version });
  } catch {
    return NextResponse.json({ error: "Failed to save version" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.tenant.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
