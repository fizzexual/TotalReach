import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { ActivityList } from "@/components/activity-list";
import { ActivityFormModal } from "@/components/forms/activity-form-modal";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "open", label: "Open" },
  { key: "overdue", label: "Overdue" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireUser();
  const { filter: f } = await searchParams;
  const filter = FILTERS.some((x) => x.key === f) ? (f as string) : "open";

  const where: Prisma.ActivityWhereInput = { ownerId: user.id };
  if (filter === "open") where.completed = false;
  else if (filter === "completed") where.completed = true;
  else if (filter === "overdue") {
    where.completed = false;
    where.dueDate = { lt: new Date() };
  }

  const [activities, contacts, deals] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: [{ completed: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      include: { contact: true, deal: true },
    }),
    prisma.contact.findMany({
      where: { ownerId: user.id },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.deal.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  const contactOptions = contacts.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}` }));
  const dealOptions = deals.map((d) => ({ id: d.id, title: d.title }));

  return (
    <div>
      <PageHeader title="Tasks & activities" subtitle="Calls, emails, meetings, notes, and to-dos.">
        <ActivityFormModal contacts={contactOptions} deals={dealOptions} triggerLabel="Log activity" triggerVariant="primary" />
      </PageHeader>

      <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1 text-sm">
        {FILTERS.map((t) => (
          <Link
            key={t.key}
            href={`/tasks?filter=${t.key}`}
            className={cn(
              "rounded-md px-3 py-1.5 font-medium transition",
              filter === t.key ? "bg-emerald-500/15 text-emerald-300" : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activities.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Nothing here"
          description="No activities match this filter. Log a call, email, meeting, or to-do to get started."
        />
      ) : (
        <Card className="overflow-hidden">
          <ActivityList activities={activities} showLinks />
        </Card>
      )}
    </div>
  );
}
