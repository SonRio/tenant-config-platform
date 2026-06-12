import { TenantForm } from "@/components/tenant-form";
import { PageHeading } from "@/components/page-heading";

export default function NewTenantPage() {
  return (
    <div className="grid gap-6">
      <PageHeading titleKey="form.newTitle" />
      <TenantForm />
    </div>
  );
}
