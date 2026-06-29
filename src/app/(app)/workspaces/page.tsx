import { LayoutGrid } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";

export default function WorkspacesPage() {
  return (
    <div>
      <PageHeader title="Workspaces" subtitle="Organize records into focused views." />
      <EmptyState icon={LayoutGrid} title="No workspaces yet" description="Group companies, people, and deals into shared workspaces for your team." />
    </div>
  );
}
