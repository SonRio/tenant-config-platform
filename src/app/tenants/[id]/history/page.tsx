import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { HistoryClient } from "@/components/history-client";
import { PageHeading } from "@/components/page-heading";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) notFound();

  return (
    <div className="grid gap-6">
      <PageHeading
        titleKey="history.title"
        subtitleKey="history.subtitle"
        vars={{ name: tenant.name }}
      />
      <HistoryClient tenantId={id} />
    </div>
  );
}
