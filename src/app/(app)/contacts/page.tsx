import Link from "next/link";
import { Users, Search } from "lucide-react";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Avatar, Badge, Input, PageHeader } from "@/components/ui";
import { CONTACT_STATUS_BADGE, type ContactStatus } from "@/lib/constants";
import { ContactFormModal } from "@/components/forms/contact-form-modal";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const where: Prisma.ContactWhereInput = {
    ownerId: user.id,
    ...(query
      ? {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { email: { contains: query } },
            { title: { contains: query } },
          ],
        }
      : {}),
  };

  const [contacts, companies] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { company: { select: { id: true, name: true } } },
    }),
    prisma.company.findMany({
      where: { ownerId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="People"
        subtitle={`${contacts.length} ${contacts.length === 1 ? "person" : "people"}${query ? ` matching “${query}”` : ""}`}
      >
        <ContactFormModal companies={companies} triggerLabel="New person" />
      </PageHeader>

      <form className="mb-4 max-w-sm" action="/contacts">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input name="q" defaultValue={query} placeholder="Search people…" className="pl-9" />
        </div>
      </form>

      {contacts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-zinc-500">
            <Users className="h-6 w-6" />
          </span>
          <h3 className="text-sm font-semibold text-zinc-200">{query ? "No people found" : "No people yet"}</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {query ? "Try a different search term." : "Add your first person to start building your network."}
          </p>
          {!query && (
            <div className="mt-4 flex justify-center">
              <ContactFormModal companies={companies} triggerLabel="New person" />
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.07]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] bg-white/[0.02] text-left text-xs font-medium text-zinc-500">
                  <th className="px-5 py-2.5">Name</th>
                  <th className="px-5 py-2.5">Company</th>
                  <th className="px-5 py-2.5">Email</th>
                  <th className="hidden px-5 py-2.5 md:table-cell">Phone</th>
                  <th className="px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {contacts.map((c) => (
                  <tr key={c.id} className="group transition hover:bg-white/[0.03]">
                    <td className="px-5 py-2.5">
                      <Link href={`/contacts/${c.id}`} className="flex items-center gap-3">
                        <Avatar name={`${c.firstName} ${c.lastName}`} className="h-9 w-9" />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-zinc-100 group-hover:text-white">
                            {c.firstName} {c.lastName}
                          </span>
                          {c.title && <span className="block truncate text-xs text-zinc-500">{c.title}</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-2.5 text-zinc-300">{c.company?.name ?? "—"}</td>
                    <td className="px-5 py-2.5 text-zinc-300">{c.email ?? "—"}</td>
                    <td className="hidden px-5 py-2.5 text-zinc-300 md:table-cell">{c.phone ?? "—"}</td>
                    <td className="px-5 py-2.5">
                      <Badge className={CONTACT_STATUS_BADGE[c.status as ContactStatus] ?? "bg-zinc-500/15 text-zinc-400"}>
                        {c.status}
                      </Badge>
                    </td>
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
