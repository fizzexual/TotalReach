import Link from "next/link";
import { Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { mailStatusFor } from "@/lib/mailer";
import { fromNow } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<string, string> = {
  sent: "bg-emerald-500/15 text-emerald-300",
  queued: "bg-zinc-500/15 text-zinc-300",
  failed: "bg-rose-500/15 text-rose-300",
  skipped: "bg-amber-500/15 text-amber-300",
};

export default async function EmailsPage() {
  const user = await requireUser();
  const status = await mailStatusFor(user.id);
  const configured = status.configured;
  const emails = await prisma.emailMessage.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader title="Emails" subtitle="Messages sent by your automations." />

      <div
        className={cn(
          "mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
          configured
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
            : "border-amber-500/20 bg-amber-500/10 text-amber-300",
        )}
      >
        {configured ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
        {configured ? (
          <span>Email connected{status.from ? ` as ${status.from}` : ""} — automations send for real.</span>
        ) : (
          <span>
            No email connected.{" "}
            <Link href="/integrations" className="font-medium underline underline-offset-2">
              Connect an account
            </Link>{" "}
            to send for real — messages are still logged here.
          </span>
        )}
      </div>

      {emails.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No emails yet"
          description="Run an automation with a “Send email” step to send your first message."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.07]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] bg-white/[0.02] text-left text-xs font-medium text-zinc-500">
                  <th className="px-5 py-2.5">To</th>
                  <th className="px-5 py-2.5">Subject</th>
                  <th className="px-5 py-2.5">Status</th>
                  <th className="px-5 py-2.5">Opened</th>
                  <th className="px-5 py-2.5">Source</th>
                  <th className="px-5 py-2.5">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {emails.map((m) => (
                  <tr key={m.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-2.5 text-zinc-200">{m.to}</td>
                    <td className="px-5 py-2.5 text-zinc-300">{m.subject}</td>
                    <td className="px-5 py-2.5">
                      <Badge className={STATUS_BADGE[m.status] ?? "bg-zinc-500/15 text-zinc-300"}>{m.status}</Badge>
                    </td>
                    <td className="px-5 py-2.5 text-zinc-400">
                      {m.openedAt ? `Opened${m.opens > 1 ? ` ×${m.opens}` : ""}` : "—"}
                    </td>
                    <td className="px-5 py-2.5 text-zinc-400">{m.source}</td>
                    <td className="px-5 py-2.5 text-zinc-500">{fromNow(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
