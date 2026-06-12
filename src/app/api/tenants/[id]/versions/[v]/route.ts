import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string; v: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id, v } = await params;
  const version = Number(v);
  if (!Number.isInteger(version)) {
    return NextResponse.json({ error: "Invalid version" }, { status: 400 });
  }

  const row = await prisma.configVersion.findUnique({
    where: { tenantId_version: { tenantId: id, version } },
  });
  if (!row) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }
  return NextResponse.json({
    version: row.version,
    note: row.note,
    createdAt: row.createdAt,
    config: row.config,
  });
}
