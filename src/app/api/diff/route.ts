import { NextResponse } from "next/server";
import { getActiveConfig } from "@/lib/config-versions";
import { diffConfigs, countDifferences } from "@/lib/diff";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const a = searchParams.get("a");
  const b = searchParams.get("b");
  if (!a || !b) {
    return NextResponse.json(
      { error: "Both tenant ids (a, b) are required" },
      { status: 400 }
    );
  }

  const [configA, configB] = await Promise.all([
    getActiveConfig(a),
    getActiveConfig(b),
  ]);
  if (!configA || !configB) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const diff = diffConfigs(configA, configB);
  return NextResponse.json({ diff, total: countDifferences(diff) });
}
