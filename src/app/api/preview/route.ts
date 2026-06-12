import { NextResponse } from "next/server";
import { processClaimById } from "@/lib/config-versions";
import { claimDataSchema } from "@/lib/claim-schema";

// Read-only: runs the same processClaim the runtime uses. No version written.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const tenantId = body?.tenantId;
  if (typeof tenantId !== "string") {
    return NextResponse.json({ error: "tenantId required" }, { status: 400 });
  }
  const parsed = claimDataSchema.safeParse(body?.claim);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid claim", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await processClaimById(tenantId, parsed.data);
  if (!result) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}
