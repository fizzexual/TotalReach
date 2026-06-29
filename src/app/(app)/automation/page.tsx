import { Workflow } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";

export default function AutomationPage() {
  return (
    <div>
      <PageHeader title="Automation" subtitle="Build workflows that run themselves." />
      <EmptyState icon={Workflow} title="No automations yet" description="Create rules to move deals, assign tasks, and keep data clean automatically." />
    </div>
  );
}
