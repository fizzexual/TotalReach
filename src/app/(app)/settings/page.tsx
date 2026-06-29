import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Button, PageHeader, SectionCard } from "@/components/ui";
import { logoutAction } from "@/lib/actions/auth";
import { formatDate } from "@/lib/format";
import { ProfileForm } from "./profile-form";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account and profile." />

      <div className="space-y-6">
        <SectionCard title="Profile">
          <ProfileForm name={user.name} email={user.email} />
        </SectionCard>

        <SectionCard title="Account">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500">Email</dt>
              <dd className="font-medium text-zinc-200">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500">Member since</dt>
              <dd className="font-medium text-zinc-200">{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
          <form action={logoutAction} className="mt-5 border-t border-white/[0.07] pt-4">
            <Button type="submit" variant="secondary">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
