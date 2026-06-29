import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Building2, Briefcase, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Avatar, Badge, Button, SectionCard } from "@/components/ui";
import { ContactFormModal } from "@/components/forms/contact-form-modal";
import { ActivityFormModal } from "@/components/forms/activity-form-modal";
import { ActivityList } from "@/components/activity-list";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteContact } from "@/lib/actions/contacts";
import { CONTACT_STATUS_BADGE, STAGE_META, type ContactStatus, type DealStage } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
      <span className="w-16 shrink-0 text-zinc-500">{label}</span>
      {value ? (
        href ? (
          <Link href={href} className="truncate text-zinc-200 hover:text-emerald-400">
            {value}
          </Link>
        ) : (
          <span className="truncate text-zinc-200">{value}</span>
        )
      ) : (
        <span className="text-zinc-600">—</span>
      )}
    </div>
  );
}

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, ownerId: user.id },
    include: {
      company: true,
      deals: { orderBy: { updatedAt: "desc" } },
      activities: { orderBy: [{ completed: "asc" }, { createdAt: "desc" }] },
    },
  });
  if (!contact) notFound();

  const companies = await prisma.company.findMany({
    where: { ownerId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const fullName = `${contact.firstName} ${contact.lastName}`;

  return (
    <div>
      <Link href="/contacts" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200">
        <ArrowLeft className="h-4 w-4" /> People
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={fullName} className="h-14 w-14 text-lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{fullName}</h1>
            <p className="text-sm text-zinc-400">
              {contact.title ?? "—"}
              {contact.company ? (
                <>
                  {" · "}
                  <Link href={`/companies/${contact.company.id}`} className="text-emerald-400 hover:text-emerald-300">
                    {contact.company.name}
                  </Link>
                </>
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ContactFormModal
            companies={companies}
            contact={{
              id: contact.id,
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              phone: contact.phone,
              title: contact.title,
              status: contact.status,
              companyId: contact.companyId,
              notes: contact.notes,
            }}
            trigger={
              <Button variant="secondary">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            }
          />
          <form action={deleteContact}>
            <input type="hidden" name="id" value={contact.id} />
            <ConfirmButton type="submit" variant="ghost" size="icon" message={`Delete ${fullName}? This cannot be undone.`}>
              <Trash2 className="h-4 w-4 text-zinc-400" />
            </ConfirmButton>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <SectionCard title="Details">
            <dl className="space-y-3 text-sm">
              <DetailRow icon={Mail} label="Email" value={contact.email} href={contact.email ? `mailto:${contact.email}` : undefined} />
              <DetailRow icon={Phone} label="Phone" value={contact.phone} href={contact.phone ? `tel:${contact.phone}` : undefined} />
              <DetailRow icon={Briefcase} label="Title" value={contact.title} />
              <DetailRow
                icon={Building2}
                label="Company"
                value={contact.company?.name ?? null}
                href={contact.company ? `/companies/${contact.company.id}` : undefined}
              />
            </dl>
            <div className="mt-4 flex items-center gap-2 border-t border-white/[0.07] pt-4">
              <span className="text-sm text-zinc-500">Status</span>
              <Badge className={CONTACT_STATUS_BADGE[contact.status as ContactStatus] ?? "bg-zinc-500/15 text-zinc-400"}>
                {contact.status}
              </Badge>
            </div>
          </SectionCard>

          {contact.notes && (
            <SectionCard title="Notes">
              <p className="whitespace-pre-line text-sm text-zinc-300">{contact.notes}</p>
            </SectionCard>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Deals" bodyClassName="p-0" action={<span className="text-sm text-zinc-500">{contact.deals.length}</span>}>
            {contact.deals.length === 0 ? (
              <p className="px-5 py-6 text-sm text-zinc-500">No deals linked to this person.</p>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {contact.deals.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <Link href="/deals" className="min-w-0">
                      <span className="block truncate font-medium text-zinc-200 hover:text-emerald-400">{d.title}</span>
                      <span className="text-xs text-zinc-500">
                        {formatCurrency(d.value)}
                        {d.closeDate ? ` · closes ${formatDate(d.closeDate)}` : ""}
                      </span>
                    </Link>
                    <Badge className={STAGE_META[d.stage as DealStage]?.badge ?? "bg-zinc-500/15 text-zinc-400"}>{d.stage}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Activity"
            bodyClassName="p-0"
            action={<ActivityFormModal preset={{ contactId: contact.id }} triggerLabel="Log" triggerVariant="ghost" />}
          >
            <ActivityList activities={contact.activities} showLinks={false} emptyText="No activity logged yet." />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
