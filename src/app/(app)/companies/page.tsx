import Link from "next/link";
import {
  Info,
  LayoutGrid,
  ChevronDown,
  Settings2,
  Upload,
  ArrowDownUp,
  ListFilter,
  MoreHorizontal,
  Plus,
  Globe,
  CircleDollarSign,
  Target,
  Zap,
  Building2,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge, EmptyState } from "@/components/ui";
import { ICP_FIT_BADGE, CONNECTION_META, tintFor } from "@/lib/constants";
import { CompanyFormModal } from "@/components/forms/company-form-modal";
import { cn } from "@/lib/utils";

function ToolbarButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-sm text-zinc-300 transition hover:bg-white/[0.06]",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Th({ icon: Icon, label, className }: { icon?: React.ComponentType<{ className?: string }>; label: string; className?: string }) {
  return (
    <th className={cn("whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-zinc-500", className)}>
      <span className="inline-flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-zinc-600" />}
        {label}
      </span>
    </th>
  );
}

export default async function CompaniesPage() {
  const user = await requireUser();

  const companies = await prisma.company.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      deals: { select: { id: true, title: true }, orderBy: { createdAt: "asc" }, take: 3 },
      _count: { select: { contacts: true, deals: true } },
    },
  });

  return (
    <div>
      {/* Title row */}
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Companies</h1>
        <Info className="h-4 w-4 text-zinc-600" />
      </div>

      {/* View row */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-zinc-200"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20 text-emerald-300">
            <LayoutGrid className="h-3.5 w-3.5" />
          </span>
          Top companies
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        </button>

        <div className="flex items-center gap-2">
          <ToolbarButton>
            <Settings2 className="h-4 w-4 text-zinc-400" /> View settings
          </ToolbarButton>
          <ToolbarButton>
            <Upload className="h-4 w-4 text-zinc-400" /> Import / Export <ChevronDown className="h-4 w-4 text-zinc-500" />
          </ToolbarButton>
        </div>
      </div>

      {/* Filter row */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ToolbarButton>
          <ArrowDownUp className="h-4 w-4 text-zinc-400" /> Sort by: <span className="text-zinc-100">Last email interaction</span>
        </ToolbarButton>
        <ToolbarButton>
          <ListFilter className="h-4 w-4 text-zinc-400" /> Advanced filter
          <span className="ml-0.5 rounded bg-white/10 px-1.5 text-[11px] text-zinc-300">3</span>
        </ToolbarButton>
        <ToolbarButton className="px-2">
          <MoreHorizontal className="h-4 w-4 text-zinc-400" />
        </ToolbarButton>
        <CompanyFormModal
          trigger={
            <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5 text-sm text-zinc-300 transition hover:bg-white/[0.06]">
              <Plus className="h-4 w-4 text-zinc-400" />
            </span>
          }
        />
      </div>

      {/* Table */}
      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Add the organizations you're working with."
          action={<CompanyFormModal />}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.07]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                  <th className="w-10 px-3 py-2.5">
                    <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-500" aria-label="Select all" />
                  </th>
                  <Th label="Company" />
                  <Th icon={Globe} label="Domains" />
                  <Th icon={CircleDollarSign} label="Associated deals" />
                  <Th icon={Target} label="ICP Fit" />
                  <Th icon={CircleDollarSign} label="Estimated ARR" />
                  <Th icon={Zap} label="Connection strength" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {companies.map((c) => {
                  const conn = c.connectionStrength ? CONNECTION_META[c.connectionStrength] : null;
                  return (
                    <tr key={c.id} className="group transition hover:bg-white/[0.03]">
                      <td className="px-3 py-2.5 align-middle">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-white/20 bg-white/5 opacity-0 accent-emerald-500 transition group-hover:opacity-100 focus:opacity-100"
                          aria-label={`Select ${c.name}`}
                        />
                      </td>

                      <td className="px-4 py-2.5">
                        <Link href={`/companies/${c.id}`} className="flex items-center gap-2.5">
                          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold", tintFor(c.name))}>
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-medium text-zinc-100 group-hover:text-white">{c.name}</span>
                        </Link>
                      </td>

                      <td className="px-4 py-2.5">
                        {c.domain ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-xs text-zinc-300">
                            <Globe className="h-3 w-3 text-zinc-500" />
                            {c.domain}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      <td className="px-4 py-2.5">
                        {c.deals.length ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {c.deals.slice(0, 2).map((d) => (
                              <span
                                key={d.id}
                                className="inline-flex max-w-[160px] items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-xs text-zinc-300"
                              >
                                <CircleDollarSign className="h-3 w-3 shrink-0 text-emerald-400" />
                                <span className="truncate">{d.title}</span>
                              </span>
                            ))}
                            {c.deals.length > 2 && <span className="text-xs text-zinc-500">+{c.deals.length - 2}</span>}
                          </div>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      <td className="px-4 py-2.5">
                        {c.icpFit ? (
                          <Badge className={ICP_FIT_BADGE[c.icpFit] ?? "bg-zinc-500/15 text-zinc-400"}>{c.icpFit}</Badge>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-2.5 text-zinc-300">{c.estimatedArr ?? "—"}</td>

                      <td className="px-4 py-2.5">
                        {conn ? (
                          <span className={cn("inline-flex items-center gap-1.5 text-sm", conn.color)}>
                            <Zap className="h-3.5 w-3.5 fill-current" />
                            {conn.label}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
