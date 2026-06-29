import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@totalreach.app";

function statusForStage(stage: string) {
  return stage === "Won" ? "Won" : stage === "Lost" ? "Lost" : "Open";
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // Idempotent: removing the demo user cascades to all their data.
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) await prisma.user.delete({ where: { email: DEMO_EMAIL } });

  const user = await prisma.user.create({
    data: { name: "Demo User", email: DEMO_EMAIL, passwordHash },
  });
  const ownerId = user.id;

  const companyData = [
    { key: "acme", name: "Acme Inc.", industry: "SaaS", location: "San Francisco, CA", website: "https://acme.example.com", domain: "acme.example.com", phone: "+1 415 555 0101" },
    { key: "globex", name: "Globex Corporation", industry: "Manufacturing", location: "Chicago, IL", website: "https://globex.example.com", domain: "globex.example.com", phone: "+1 312 555 0144" },
    { key: "initech", name: "Initech", industry: "Fintech", location: "Austin, TX", website: "https://initech.example.com", domain: "initech.example.com", phone: "+1 512 555 0188" },
    { key: "umbrella", name: "Umbrella Health", industry: "Healthcare", location: "Boston, MA", website: "https://umbrella.example.com", domain: "umbrella.example.com", phone: "+1 617 555 0199" },
    { key: "hooli", name: "Hooli", industry: "Technology", location: "Palo Alto, CA", website: "https://hooli.example.com", domain: "hooli.example.com", phone: "+1 650 555 0123" },
    { key: "soylent", name: "Soylent Co.", industry: "Food & Beverage", location: "New York, NY", website: "https://soylent.example.com", domain: "soylent.example.com", phone: "+1 212 555 0177" },
  ];

  const companies: Record<string, string> = {};
  for (const c of companyData) {
    const { key, ...rest } = c;
    const created = await prisma.company.create({ data: { ...rest, ownerId } });
    companies[key] = created.id;
  }

  const contactData = [
    { key: "jane", firstName: "Jane", lastName: "Cooper", title: "Head of Sales", email: "jane.cooper@acme.example.com", phone: "+1 415 555 0102", status: "Active", company: "acme" },
    { key: "wade", firstName: "Wade", lastName: "Warren", title: "VP Operations", email: "wade.warren@acme.example.com", phone: "+1 415 555 0103", status: "Active", company: "acme" },
    { key: "esther", firstName: "Esther", lastName: "Howard", title: "Procurement Lead", email: "esther.howard@globex.example.com", phone: "+1 312 555 0145", status: "Lead", company: "globex" },
    { key: "cameron", firstName: "Cameron", lastName: "Williamson", title: "CTO", email: "cameron@globex.example.com", phone: "+1 312 555 0146", status: "Active", company: "globex" },
    { key: "brooklyn", firstName: "Brooklyn", lastName: "Simmons", title: "Finance Director", email: "brooklyn@initech.example.com", phone: "+1 512 555 0189", status: "Lead", company: "initech" },
    { key: "leslie", firstName: "Leslie", lastName: "Alexander", title: "Office Manager", email: "leslie@initech.example.com", phone: "+1 512 555 0190", status: "Inactive", company: "initech" },
    { key: "guy", firstName: "Guy", lastName: "Hawkins", title: "Chief Medical Officer", email: "guy.hawkins@umbrella.example.com", phone: "+1 617 555 0200", status: "Active", company: "umbrella" },
    { key: "robert", firstName: "Robert", lastName: "Fox", title: "Head of IT", email: "robert.fox@umbrella.example.com", phone: "+1 617 555 0201", status: "Lead", company: "umbrella" },
    { key: "jacob", firstName: "Jacob", lastName: "Jones", title: "Product Lead", email: "jacob.jones@hooli.example.com", phone: "+1 650 555 0124", status: "Active", company: "hooli" },
    { key: "kristin", firstName: "Kristin", lastName: "Watson", title: "Growth Manager", email: "kristin@hooli.example.com", phone: "+1 650 555 0125", status: "Lead", company: "hooli" },
    { key: "dianne", firstName: "Dianne", lastName: "Russell", title: "Supply Chain Manager", email: "dianne@soylent.example.com", phone: "+1 212 555 0178", status: "Active", company: "soylent" },
    { key: "marvin", firstName: "Marvin", lastName: "McKinney", title: "Founder", email: "marvin@soylent.example.com", phone: "+1 212 555 0179", status: "Lead", company: "soylent" },
  ];

  const contacts: Record<string, string> = {};
  for (const c of contactData) {
    const { key, company, ...rest } = c;
    const created = await prisma.contact.create({
      data: { ...rest, companyId: companies[company] ?? null, ownerId },
    });
    contacts[key] = created.id;
  }

  const dealData = [
    { key: "acme-ent", title: "Acme — Annual Enterprise plan", value: 48000, stage: "Negotiation", order: 0, contact: "jane", company: "acme", closeInDays: 18 },
    { key: "acme-addon", title: "Acme — Analytics add-on", value: 12000, stage: "Proposal", order: 0, contact: "wade", company: "acme", closeInDays: 30 },
    { key: "globex-rollout", title: "Globex — Team rollout", value: 36000, stage: "Qualified", order: 0, contact: "cameron", company: "globex", closeInDays: 45 },
    { key: "globex-pilot", title: "Globex — Pilot program", value: 8000, stage: "Lead", order: 0, contact: "esther", company: "globex", closeInDays: 60 },
    { key: "initech-migration", title: "Initech — CRM migration", value: 22000, stage: "Proposal", order: 1, contact: "brooklyn", company: "initech", closeInDays: 25 },
    { key: "umbrella-platform", title: "Umbrella — Platform license", value: 64000, stage: "Negotiation", order: 1, contact: "guy", company: "umbrella", closeInDays: 12 },
    { key: "umbrella-support", title: "Umbrella — Premium support", value: 15000, stage: "Qualified", order: 1, contact: "robert", company: "umbrella", closeInDays: 50 },
    { key: "hooli-expansion", title: "Hooli — Seat expansion", value: 28000, stage: "Won", order: 0, contact: "jacob", company: "hooli", closeInDays: -5 },
    { key: "hooli-trial", title: "Hooli — Growth trial", value: 9000, stage: "Lead", order: 1, contact: "kristin", company: "hooli", closeInDays: 40 },
    { key: "soylent-supply", title: "Soylent — Supply integration", value: 31000, stage: "Won", order: 1, contact: "dianne", company: "soylent", closeInDays: -12 },
    { key: "soylent-founder", title: "Soylent — Founder package", value: 5000, stage: "Lost", order: 0, contact: "marvin", company: "soylent", closeInDays: -20 },
  ];

  const deals: Record<string, string> = {};
  for (const d of dealData) {
    const { key, contact, company, closeInDays, ...rest } = d;
    const created = await prisma.deal.create({
      data: {
        ...rest,
        status: statusForStage(rest.stage),
        closeDate: closeInDays != null ? addDays(new Date(), closeInDays) : null,
        contactId: contacts[contact] ?? null,
        companyId: companies[company] ?? null,
        ownerId,
      },
    });
    deals[key] = created.id;
  }

  const activityData = [
    { type: "Call", title: "Discovery call with Jane", notes: "Walked through pipeline needs. Strong fit.", contact: "jane", deal: "acme-ent", dueInDays: -3, completed: true },
    { type: "Email", title: "Send Acme proposal", notes: "Include analytics add-on pricing.", contact: "wade", deal: "acme-addon", dueInDays: 1, completed: false },
    { type: "Meeting", title: "Globex technical review", notes: "Cameron wants SSO + audit logs.", contact: "cameron", deal: "globex-rollout", dueInDays: 2, completed: false },
    { type: "Task", title: "Follow up with Esther", contact: "esther", deal: "globex-pilot", dueInDays: -1, completed: false },
    { type: "Call", title: "Initech migration scoping", contact: "brooklyn", deal: "initech-migration", dueInDays: 4, completed: false },
    { type: "Meeting", title: "Umbrella contract negotiation", notes: "Legal to review MSA.", contact: "guy", deal: "umbrella-platform", dueInDays: 0, completed: false },
    { type: "Note", title: "Robert prefers quarterly billing", contact: "robert", deal: "umbrella-support", completed: false },
    { type: "Email", title: "Hooli onboarding kickoff", contact: "jacob", deal: "hooli-expansion", dueInDays: -6, completed: true },
    { type: "Task", title: "Prepare Q3 pipeline report", dueInDays: 5, completed: false },
    { type: "Call", title: "Reconnect with Kristin", contact: "kristin", deal: "hooli-trial", dueInDays: 7, completed: false },
    { type: "Meeting", title: "Soylent integration handoff", contact: "dianne", deal: "soylent-supply", dueInDays: -10, completed: true },
    { type: "Note", title: "Soylent founder deal lost to competitor", contact: "marvin", deal: "soylent-founder", completed: true },
    { type: "Task", title: "Update CRM data hygiene checklist", dueInDays: 3, completed: false },
  ];

  for (const a of activityData) {
    const { contact, deal, dueInDays, completed, ...rest } = a;
    await prisma.activity.create({
      data: {
        ...rest,
        dueDate: dueInDays != null ? addDays(new Date(), dueInDays) : null,
        completed: Boolean(completed),
        completedAt: completed ? new Date() : null,
        contactId: contact ? (contacts[contact] ?? null) : null,
        dealId: deal ? (deals[deal] ?? null) : null,
        ownerId,
      },
    });
  }

  const counts = {
    companies: companyData.length,
    contacts: contactData.length,
    deals: dealData.length,
    activities: activityData.length,
  };
  console.log(`Seeded demo workspace for ${DEMO_EMAIL} (password: password123)`);
  console.log(counts);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
