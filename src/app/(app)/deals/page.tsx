import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, PageHeader } from "@/components/ui";
import { DealBoard } from "@/components/deals/deal-board";
import { DealFormModal } from "@/components/forms/deal-form-modal";
import type { DealCardData } from "@/components/forms/deal-fields";
import { formatCurrency } from "@/lib/format";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </Card>
  );
}

export default async function DealsPage() {
  const user = await requireUser();
  const ownerId = user.id;

  const [deals, contacts, companies] = await Promise.all([
    prisma.deal.findMany({
      where: { ownerId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        contact: { select: { firstName: true, lastName: true } },
        company: { select: { name: true } },
      },
    }),
    prisma.contact.findMany({
      where: { ownerId },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.company.findMany({
      where: { ownerId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const data: DealCardData[] = deals.map((d) => ({
    id: d.id,
    title: d.title,
    value: d.value,
    stage: d.stage,
    status: d.status,
    closeDate: d.closeDate,
    notes: d.notes,
    contactId: d.contactId,
    companyId: d.companyId,
    contactName: d.contact ? `${d.contact.firstName} ${d.contact.lastName}` : null,
    companyName: d.company?.name ?? null,
    order: d.order,
  }));

  const contactOptions = contacts.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}` }));
  const companyOptions = companies.map((c) => ({ id: c.id, name: c.name }));

  const open = data.filter((d) => d.status === "Open");
  const openValue = open.reduce((s, d) => s + d.value, 0);
  const wonValue = data.filter((d) => d.status === "Won").reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <PageHeader title="Deals" subtitle="Drag deals across stages to update your pipeline.">
        <DealFormModal contacts={contactOptions} companies={companyOptions} />
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Open pipeline" value={formatCurrency(openValue)} />
        <Stat label="Open deals" value={String(open.length)} />
        <Stat label="Won" value={formatCurrency(wonValue)} />
        <Stat label="Total deals" value={String(data.length)} />
      </div>

      <DealBoard deals={data} contacts={contactOptions} companies={companyOptions} />
    </div>
  );
}
