import Link from "next/link";
import { Users, Search } from "lucide-react";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Avatar, Badge, Card, EmptyState, Input, PageHeader } from "@/components/ui";
import { CONTACT_STATUS_BADGE, type ContactStatus } from "@/lib/constants";
import { ContactFormModal } from "@/components/forms/contact-form-modal";

export default async function ContactsPage({
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
        title="Contacts"
        subtitle={`${contacts.length} ${contacts.length === 1 ? "contact" : "contacts"}${query ? ` matching “${query}”` : ""}`}
      >
        <ContactFormModal companies={companies} />
      </PageHeader>

      <form className="mb-4 max-w-sm" action="/contacts">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input name="q" defaultValue={query} placeholder="Search contacts…" className="pl-9" />
        </div>
      </form>

      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "No contacts found" : "No contacts yet"}
          description={query ? "Try a different search term." : "Add your first contact to start building your network."}
          action={query ? undefined : <ContactFormModal companies={companies} />}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Phone</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((c) => (
                  <tr key={c.id} className="group transition hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <Link href={`/contacts/${c.id}`} className="flex items-center gap-3">
                        <Avatar name={`${c.firstName} ${c.lastName}`} className="h-9 w-9" />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-slate-800 group-hover:text-indigo-700">
                            {c.firstName} {c.lastName}
                          </span>
                          {c.title && <span className="block truncate text-xs text-slate-400">{c.title}</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{c.company?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{c.email ?? "—"}</td>
                    <td className="hidden px-5 py-3 text-slate-600 md:table-cell">{c.phone ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge className={CONTACT_STATUS_BADGE[c.status as ContactStatus] ?? "bg-slate-100 text-slate-600"}>
                        {c.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
