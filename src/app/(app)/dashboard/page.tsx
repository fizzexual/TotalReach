import Link from "next/link";
import { startOfMonth } from "date-fns";
import { Users, Target, Trophy, TrendingUp, ArrowUpRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge, Card, EmptyState, PageHeader, SectionCard } from "@/components/ui";
import { DEAL_STAGES, STAGE_META, ACTIVITY_META, type ActivityType } from "@/lib/constants";
import { formatCurrency, formatNumber, fromNow, formatDate, dueState } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DashboardChart } from "./dashboard-chart";

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card className="p-5">
      <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-lg", accent)}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-zinc-100">{value}</p>
      <p className="mt-1 text-sm text-zinc-400">{label}</p>
    </Card>
  );
}

export default async function ReportsPage() {
  const user = await requireUser();
  const ownerId = user.id;
  const monthStart = startOfMonth(new Date());

  const [contactsCount, deals, recentActivities, upcomingTasks] = await Promise.all([
    prisma.contact.count({ where: { ownerId } }),
    prisma.deal.findMany({
      where: { ownerId },
      select: { id: true, value: true, stage: true, status: true, updatedAt: true },
    }),
    prisma.activity.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { contact: true, deal: true },
    }),
    prisma.activity.findMany({
      where: { ownerId, completed: false, dueDate: { not: null } },
      orderBy: { dueDate: "asc" },
      take: 6,
      include: { contact: true, deal: true },
    }),
  ]);

  const openDeals = deals.filter((d) => d.status === "Open");
  const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);
  const wonThisMonth = deals.filter((d) => d.status === "Won" && d.updatedAt >= monthStart);
  const wonValueThisMonth = wonThisMonth.reduce((sum, d) => sum + d.value, 0);

  const byStage = DEAL_STAGES.map((stage) => {
    const items = deals.filter((d) => d.stage === stage);
    return { stage, count: items.length, value: items.reduce((sum, d) => sum + d.value, 0) };
  });
  const maxStageValue = Math.max(1, ...byStage.map((s) => s.value));
  const chartData = byStage.filter((s) => s.stage !== "Lost").map((s) => ({ stage: s.stage, value: s.value }));

  return (
    <div>
      <PageHeader title="Reports" subtitle="Pipeline performance at a glance." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Open pipeline value" value={formatCurrency(pipelineValue)} accent="bg-emerald-500/10 text-emerald-400" />
        <StatCard icon={Target} label="Open deals" value={formatNumber(openDeals.length)} accent="bg-violet-500/10 text-violet-400" />
        <StatCard icon={Trophy} label="Won this month" value={formatCurrency(wonValueThisMonth)} accent="bg-amber-500/10 text-amber-400" />
        <StatCard icon={Users} label="People" value={formatNumber(contactsCount)} accent="bg-sky-500/10 text-sky-400" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Pipeline value by stage"
          className="lg:col-span-2"
          action={
            <Link href="/deals" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300">
              View board <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        >
          {deals.length === 0 ? (
            <EmptyState icon={Target} title="No deals yet" description="Create your first deal to start tracking your pipeline." />
          ) : (
            <DashboardChart data={chartData} />
          )}
        </SectionCard>

        <SectionCard title="Stage breakdown">
          <ul className="space-y-3.5">
            {byStage.map((s) => (
              <li key={s.stage}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-zinc-300">
                    <span className={cn("h-2 w-2 rounded-full", STAGE_META[s.stage].dot)} />
                    {s.stage}
                  </span>
                  <span className="font-medium text-zinc-100">{formatCurrency(s.value)}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div className={cn("h-full rounded-full", STAGE_META[s.stage].bar)} style={{ width: `${Math.round((s.value / maxStageValue) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Recent activity"
          bodyClassName="p-0"
          action={<Link href="/tasks" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">View all</Link>}
        >
          {recentActivities.length === 0 ? (
            <p className="px-5 py-6 text-sm text-zinc-500">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {recentActivities.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                  <Badge className={ACTIVITY_META[a.type as ActivityType]?.badge ?? "bg-zinc-500/15 text-zinc-300"}>{a.type}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-200">{a.title}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {a.contact ? `${a.contact.firstName} ${a.contact.lastName}` : a.deal ? a.deal.title : "General"}
                      {" · "}
                      {fromNow(a.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Upcoming tasks"
          bodyClassName="p-0"
          action={<Link href="/tasks" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">View all</Link>}
        >
          {upcomingTasks.length === 0 ? (
            <p className="px-5 py-6 text-sm text-zinc-500">You&apos;re all caught up.</p>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {upcomingTasks.map((t) => {
                const state = dueState(t.dueDate);
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-200">{t.title}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {t.contact ? `${t.contact.firstName} ${t.contact.lastName}` : t.deal ? t.deal.title : t.type}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-xs font-medium",
                        state === "overdue" ? "text-rose-400" : state === "today" ? "text-amber-400" : "text-zinc-500",
                      )}
                    >
                      {formatDate(t.dueDate)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
