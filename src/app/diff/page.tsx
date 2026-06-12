import { DiffClient } from "@/components/diff-client";
import { PageHeading } from "@/components/page-heading";

export default function DiffPage() {
  return (
    <div className="grid gap-6">
      <PageHeading titleKey="diff.title" subtitleKey="diff.subtitle" />
      <DiffClient />
    </div>
  );
}
