import { PreviewClient } from "@/components/preview-client";

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const { tenant } = await searchParams;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Preview</h1>
        <p className="text-sm text-muted-foreground">
          See how a claim would be processed for a tenant — identical to runtime.
        </p>
      </div>
      <PreviewClient initialTenantId={tenant ?? null} />
    </div>
  );
}
