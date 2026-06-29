import Link from "next/link";
import { Building2, Search } from "lucide-react";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, EmptyState, Input, PageHeader } from "@/components/ui";
import { CompanyFormModal } from "@/components/forms/company-form-modal";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const where: Prisma.CompanyWhereInput = {
    ownerId: user.id,
    ...(query
      ? {
          OR: [
            { name: { contains: query } },
            { industry: { contains: query } },
            { location: { contains: query } },
          ],
        }
      : {}),
  };

  const companies = await prisma.company.findMany({
    where,
    orderBy: { name: "asc" },
    include: { _count: { select: { contacts: true, deals: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle={`${companies.length} ${companies.length === 1 ? "company" : "companies"}${query ? ` matching “${query}”` : ""}`}
      >
        <CompanyFormModal />
      </PageHeader>

      <form className="mb-4 max-w-sm" action="/companies">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input name="q" defaultValue={query} placeholder="Search companies…" className="pl-9" />
        </div>
      </form>

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={query ? "No companies found" : "No companies yet"}
          description={query ? "Try a different search term." : "Add the organizations you're working with."}
          action={query ? undefined : <CompanyFormModal />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Link key={c.id} href={`/companies/${c.id}`}>
              <Card className="h-full p-5 transition hover:border-indigo-200 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">{c.name}</p>
                    <p className="truncate text-xs text-slate-400">{c.industry ?? c.location ?? c.website ?? "—"}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4 text-sm text-slate-500">
                  <span>
                    <span className="font-semibold text-slate-700">{c._count.contacts}</span> contacts
                  </span>
                  <span>
                    <span className="font-semibold text-slate-700">{c._count.deals}</span> deals
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
