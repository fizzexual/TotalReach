import { Mail, MessageSquare, Calendar, Zap, Webhook, Send, CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge, Card, PageHeader } from "@/components/ui";
import { EmailConnectForm } from "@/components/integrations/email-connect-form";
import { mailStatusFor } from "@/lib/mailer";

const SOON = [
  { name: "Slack", desc: "Notify channels on deal and task events.", icon: MessageSquare },
  { name: "Google Calendar", desc: "Sync meetings and reminders.", icon: Calendar },
  { name: "Zapier", desc: "Connect thousands of apps to your workflows.", icon: Zap },
  { name: "Webhooks", desc: "Send workspace events to any endpoint.", icon: Webhook },
  { name: "Resend", desc: "Transactional email over HTTP API.", icon: Send },
];

export default async function IntegrationsPage() {
  const user = await requireUser();
  const settings = await prisma.emailSettings.findUnique({
    where: { ownerId: user.id },
    select: { host: true, port: true, secure: true, username: true, fromName: true, fromEmail: true, verified: true },
  });
  const status = await mailStatusFor(user.id);

  return (
    <div>
      <PageHeader title="Integrations" subtitle="Connect TotalReach to the tools you use." />

      <Card className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-zinc-100">Email (SMTP)</p>
              <p className="text-sm text-zinc-400">Send automation emails from your own account.</p>
            </div>
          </div>
          {status.configured ? (
            <Badge className="bg-emerald-500/15 text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> {status.source === "env" ? "Connected (env)" : "Connected"}
            </Badge>
          ) : (
            <Badge className="bg-zinc-500/15 text-zinc-400">Not connected</Badge>
          )}
        </div>
        <EmailConnectForm settings={settings} defaultEmail={user.email} />
      </Card>

      <h2 className="mb-3 mt-8 text-sm font-semibold text-zinc-300">More connections</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SOON.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.name} className="p-5">
              <div className="flex items-start justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-zinc-300">
                  <Icon className="h-5 w-5" />
                </span>
                <Badge className="bg-white/5 text-zinc-500">Soon</Badge>
              </div>
              <p className="mt-3 font-medium text-zinc-100">{s.name}</p>
              <p className="mt-0.5 text-sm text-zinc-400">{s.desc}</p>
              <button
                type="button"
                disabled
                className="mt-4 w-full cursor-not-allowed rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-500"
              >
                Connect
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
