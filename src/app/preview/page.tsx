import { PreviewClient } from "@/components/preview-client";
import { PageHeading } from "@/components/page-heading";

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const { tenant } = await searchParams;
  return (
    <div className="grid gap-6">
      <PageHeading titleKey="preview.title" subtitleKey="preview.subtitle" />
      <PreviewClient initialTenantId={tenant ?? null} />
    </div>
  );
}
