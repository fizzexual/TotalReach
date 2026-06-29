import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, Phone, MapPin, Briefcase, Target, Zap, CircleDollarSign, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Avatar, Badge, Button, SectionCard } from "@/components/ui";
import { CompanyFormModal } from "@/components/forms/company-form-modal";
import { ActivityFormModal } from "@/components/forms/activity-form-modal";
import { ActivityList } from "@/components/activity-list";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteCompany } from "@/lib/actions/companies";
import { STAGE_META, ICP_FIT_BADGE, CONNECTION_META, tintFor, type DealStage } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

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
      <span className="w-24 shrink-0 text-zinc-500">{label}</span>
      {value ? (
        href ? (
          <Link href={href} target="_blank" className="truncate text-zinc-200 hover:text-emerald-400">
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
  const conn = company.connectionStrength ? CONNECTION_META[company.connectionStrength] : null;

  return (
    <div>
      <Link href="/companies" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200">
        <ArrowLeft className="h-4 w-4" /> Companies
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold", tintFor(company.name))}>
            {company.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{company.name}</h1>
            <p className="text-sm text-zinc-400">{company.industry ?? company.domain ?? "—"}</p>
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
              icpFit: company.icpFit,
              estimatedArr: company.estimatedArr,
              connectionStrength: company.connectionStrength,
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
              <Trash2 className="h-4 w-4 text-zinc-400" />
            </ConfirmButton>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <SectionCard title="Details">
            <dl className="space-y-3 text-sm">
              <DetailRow icon={Globe} label="Domain" value={company.domain} href={websiteHref} />
              <DetailRow icon={MapPin} label="Location" value={company.location} />
              <DetailRow icon={Briefcase} label="Industry" value={company.industry} />
              <DetailRow icon={Phone} label="Phone" value={company.phone} href={company.phone ? `tel:${company.phone}` : undefined} />
            </dl>
            <div className="mt-4 space-y-3 border-t border-white/[0.07] pt-4 text-sm">
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 shrink-0 text-zinc-500" />
                <span className="w-24 shrink-0 text-zinc-500">ICP Fit</span>
                {company.icpFit ? (
                  <Badge className={ICP_FIT_BADGE[company.icpFit] ?? "bg-zinc-500/15 text-zinc-400"}>{company.icpFit}</Badge>
                ) : (
                  <span className="text-zinc-600">—</span>
                )}
              </div>
              <DetailRow icon={CircleDollarSign} label="Est. ARR" value={company.estimatedArr} />
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 shrink-0 text-zinc-500" />
                <span className="w-24 shrink-0 text-zinc-500">Connection</span>
                {conn ? (
                  <span className={cn("inline-flex items-center gap-1.5", conn.color)}>
                    <Zap className="h-3.5 w-3.5 fill-current" /> {conn.label}
                  </span>
                ) : (
                  <span className="text-zinc-600">—</span>
                )}
              </div>
            </div>
          </SectionCard>

          {company.notes && (
            <SectionCard title="Notes">
              <p className="whitespace-pre-line text-sm text-zinc-300">{company.notes}</p>
            </SectionCard>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="People" bodyClassName="p-0" action={<span className="text-sm text-zinc-500">{company.contacts.length}</span>}>
            {company.contacts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-zinc-500">No people at this company yet.</p>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {company.contacts.map((c) => (
                  <li key={c.id} className="px-5 py-3">
                    <Link href={`/contacts/${c.id}`} className="flex items-center gap-3">
                      <Avatar name={`${c.firstName} ${c.lastName}`} className="h-9 w-9" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-zinc-200 hover:text-emerald-400">
                          {c.firstName} {c.lastName}
                        </span>
                        <span className="block truncate text-xs text-zinc-500">{c.title ?? c.email ?? ""}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Deals" bodyClassName="p-0" action={<span className="text-sm text-zinc-500">{company.deals.length}</span>}>
            {company.deals.length === 0 ? (
              <p className="px-5 py-6 text-sm text-zinc-500">No deals with this company yet.</p>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {company.deals.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <Link href="/deals" className="min-w-0">
                      <span className="block truncate font-medium text-zinc-200 hover:text-emerald-400">{d.title}</span>
                      <span className="text-xs text-zinc-500">{formatCurrency(d.value)}</span>
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
            action={<ActivityFormModal preset={{ companyId: company.id }} triggerLabel="Log" triggerVariant="ghost" />}
          >
            <ActivityList activities={company.activities} emptyText="No activity logged yet." />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
