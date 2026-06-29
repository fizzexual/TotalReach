import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, Phone, MapPin, Briefcase, Pencil, Trash2, ArrowLeft, Building2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Avatar, Badge, Button, SectionCard } from "@/components/ui";
import { CompanyFormModal } from "@/components/forms/company-form-modal";
import { ActivityFormModal } from "@/components/forms/activity-form-modal";
import { ActivityList } from "@/components/activity-list";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteCompany } from "@/lib/actions/companies";
import { STAGE_META, type DealStage } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

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
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <span className="w-20 shrink-0 text-slate-400">{label}</span>
      {value ? (
        href ? (
          <Link href={href} target="_blank" className="truncate text-slate-700 hover:text-indigo-700">
            {value}
          </Link>
        ) : (
          <span className="truncate text-slate-700">{value}</span>
        )
      ) : (
        <span className="text-slate-300">—</span>
      )}
    </div>
  );
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const company = await prisma.company.findFirst({
    where: { id, ownerId: user.id },
    include: {
      contacts: { orderBy: { createdAt: "desc" } },
      deals: { orderBy: { updatedAt: "desc" } },
      activities: {
        orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
        include: { contact: true, deal: true },
      },
    },
  });
  if (!company) notFound();

  const websiteHref = company.website
    ? company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`
    : undefined;

  return (
    <div>
      <Link href="/companies" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to companies
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Building2 className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{company.name}</h1>
            <p className="text-sm text-slate-500">{company.industry ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CompanyFormModal
            company={{
              id: company.id,
              name: company.name,
              industry: company.industry,
              website: company.website,
              domain: company.domain,
              phone: company.phone,
              location: company.location,
              notes: company.notes,
            }}
            trigger={
              <Button variant="secondary">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            }
          />
          <form action={deleteCompany}>
            <input type="hidden" name="id" value={company.id} />
            <ConfirmButton type="submit" variant="ghost" size="icon" message={`Delete ${company.name}? This cannot be undone.`}>
              <Trash2 className="h-4 w-4 text-slate-400" />
            </ConfirmButton>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <SectionCard title="Details">
            <dl className="space-y-3 text-sm">
              <DetailRow icon={Globe} label="Website" value={company.website} href={websiteHref} />
              <DetailRow icon={Phone} label="Phone" value={company.phone} href={company.phone ? `tel:${company.phone}` : undefined} />
              <DetailRow icon={MapPin} label="Location" value={company.location} />
              <DetailRow icon={Briefcase} label="Industry" value={company.industry} />
            </dl>
          </SectionCard>

          {company.notes && (
            <SectionCard title="Notes">
              <p className="whitespace-pre-line text-sm text-slate-600">{company.notes}</p>
            </SectionCard>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Contacts" bodyClassName="p-0" action={<span className="text-sm text-slate-400">{company.contacts.length}</span>}>
            {company.contacts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">No contacts at this company yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {company.contacts.map((c) => (
                  <li key={c.id} className="px-5 py-3">
                    <Link href={`/contacts/${c.id}`} className="flex items-center gap-3">
                      <Avatar name={`${c.firstName} ${c.lastName}`} className="h-9 w-9" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-800 hover:text-indigo-700">
                          {c.firstName} {c.lastName}
                        </span>
                        <span className="block truncate text-xs text-slate-400">{c.title ?? c.email ?? ""}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Deals" bodyClassName="p-0" action={<span className="text-sm text-slate-400">{company.deals.length}</span>}>
            {company.deals.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">No deals with this company yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {company.deals.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <Link href="/deals" className="min-w-0">
                      <span className="block truncate font-medium text-slate-800 hover:text-indigo-700">{d.title}</span>
                      <span className="text-xs text-slate-400">{formatCurrency(d.value)}</span>
                    </Link>
                    <Badge className={STAGE_META[d.stage as DealStage]?.badge ?? "bg-slate-100 text-slate-700"}>{d.stage}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Activity"
            bodyClassName="p-0"
            action={<ActivityFormModal preset={{ companyId: company.id }} triggerLabel="Log" triggerVariant="ghost" />}
          >
            <ActivityList activities={company.activities} emptyText="No activity logged yet." />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
