import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const versions = await prisma.configVersion.findMany({
    where: { tenantId: id },
    orderBy: { version: "desc" },
    select: { version: true, note: true, createdAt: true },
  });

  return NextResponse.json(
    versions.map((v) => ({ ...v, isCurrent: v.version === tenant.currentVersion }))
  );
}
