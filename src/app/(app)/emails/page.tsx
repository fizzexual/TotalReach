import { Mail } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";

export default function EmailsPage() {
  return (
    <div>
      <PageHeader title="Emails" subtitle="Conversations synced with your contacts." />
      <EmptyState icon={Mail} title="No inbox connected" description="Connect an email account to see threads alongside your records." />
    </div>
  );
}
