import { Bell } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader title="Notifications" subtitle="Mentions, assignments, and alerts." />
      <EmptyState icon={Bell} title="You're all caught up" description="New notifications will appear here as your team works." />
    </div>
  );
}
