import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { saveNewVersion } from "@/lib/config-versions";
import { tenantConfigSchema } from "@/config/tenant-config-schema";

type Params = { params: Promise<{ id: string }> };

// Non-destructive rollback: copy an old version's config into a NEW version.
export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const version = Number(body?.version);
  if (!Number.isInteger(version)) {
    return NextResponse.json({ error: "version required" }, { status: 400 });
  }

  const target = await prisma.configVersion.findUnique({
    where: { tenantId_version: { tenantId: id, version } },
  });
  if (!target) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  // Re-validate the historical config before resurrecting it.
  const parsed = tenantConfigSchema.safeParse(target.config);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Stored config no longer valid" },
      { status: 422 }
    );
  }

  try {
    const created = await saveNewVersion(id, parsed.data, `rollback to v${version}`);
    return NextResponse.json({ ok: true, version: created.version });
  } catch {
    return NextResponse.json({ error: "Rollback failed" }, { status: 500 });
  }
}
