import { TenantForm } from "@/components/tenant-form";

export default function NewTenantPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">New tenant</h1>
      <TenantForm />
    </div>
  );
}
