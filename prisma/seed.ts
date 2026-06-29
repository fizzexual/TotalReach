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

  // Idempotent AND stable: keep the demo user's id across reseeds so existing
  // session cookies remain valid (otherwise old cookies orphan and loop).
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  let user;
  if (existing) {
    await prisma.activity.deleteMany({ where: { ownerId: existing.id } });
    await prisma.deal.deleteMany({ where: { ownerId: existing.id } });
    await prisma.contact.deleteMany({ where: { ownerId: existing.id } });
    await prisma.company.deleteMany({ where: { ownerId: existing.id } });
    user = await prisma.user.update({ where: { id: existing.id }, data: { name: "Demo User", passwordHash } });
  } else {
    user = await prisma.user.create({ data: { name: "Demo User", email: DEMO_EMAIL, passwordHash } });
  }
  const ownerId = user.id;

  // Companies — order matches the "Top companies" view.
  const companyData = [
    { key: "shopify", name: "Shopify", domain: "shopify.com", industry: "E-commerce", location: "Ottawa, CA", icpFit: "Excellent", estimatedArr: "$500M-$650M", connectionStrength: "Very strong" },
    { key: "stripe", name: "Stripe", domain: "stripe.com", industry: "Fintech", location: "San Francisco, CA", icpFit: "Medium", estimatedArr: "$650M-$800M", connectionStrength: "Strong" },
    { key: "adobe", name: "Adobe", domain: "adobe.com", industry: "Software", location: "San Jose, CA", icpFit: "Low", estimatedArr: "$800M-$950M", connectionStrength: "Very strong" },
    { key: "miro", name: "Miro", domain: "miro.com", industry: "SaaS", location: "Amsterdam, NL", icpFit: "Medium", estimatedArr: "$950M-$1.1B", connectionStrength: "Strong" },
    { key: "zoom", name: "Zoom", domain: "zoom.com", industry: "Communications", location: "San Jose, CA", icpFit: "Medium", estimatedArr: "$1.1B-$1.25B", connectionStrength: "Very strong" },
    { key: "roku", name: "Roku", domain: "roku.com", industry: "Streaming", location: "San Jose, CA", icpFit: "Medium", estimatedArr: "$1.25B-$1.4B", connectionStrength: "Very strong" },
    { key: "dropbox", name: "Dropbox", domain: "dropbox.com", industry: "Cloud Storage", location: "San Francisco, CA", icpFit: "Excellent", estimatedArr: "$1.4B-$1.6B", connectionStrength: "Low" },
    { key: "linktree", name: "Linktree", domain: "linktree.com", industry: "SaaS", location: "Melbourne, AU", icpFit: "Excellent", estimatedArr: "$1.6B-$1.8B", connectionStrength: "Strong" },
    { key: "loom", name: "Loom", domain: "loom.com", industry: "SaaS", location: "San Francisco, CA", icpFit: "Medium", estimatedArr: "$1.8B-$2B", connectionStrength: "Very strong" },
    { key: "airbnb", name: "Airbnb", domain: "airbnb.com", industry: "Travel", location: "San Francisco, CA", icpFit: "Good", estimatedArr: "$2B-$2.25B", connectionStrength: "Low" },
    { key: "finofo", name: "Finofo", domain: "finofo.com", industry: "Fintech", location: "Toronto, CA", icpFit: "Low", estimatedArr: "$2.25B-$2.5B", connectionStrength: "Strong" },
    { key: "amie", name: "Amie", domain: "amie.com", industry: "Productivity", location: "Berlin, DE", icpFit: "Good", estimatedArr: "$2.5B-$2.75B", connectionStrength: "Very strong" },
  ];

  const companies: Record<string, string> = {};
  for (const c of companyData) {
    const { key, ...rest } = c;
    const created = await prisma.company.create({ data: { ...rest, ownerId } });
    companies[key] = created.id;
  }

  // One primary contact per company.
  const contactData = [
    { key: "harley", firstName: "Harley", lastName: "Finkelstein", title: "President", email: "harley@shopify.com", status: "Active", company: "shopify" },
    { key: "patrick", firstName: "Patrick", lastName: "Collison", title: "CEO", email: "patrick@stripe.com", status: "Active", company: "stripe" },
    { key: "shantanu", firstName: "Shantanu", lastName: "Narayen", title: "CEO", email: "shantanu@adobe.com", status: "Lead", company: "adobe" },
    { key: "andrey", firstName: "Andrey", lastName: "Khusid", title: "CEO", email: "andrey@miro.com", status: "Active", company: "miro" },
    { key: "eric", firstName: "Eric", lastName: "Yuan", title: "CEO", email: "eric@zoom.com", status: "Lead", company: "zoom" },
    { key: "anthony", firstName: "Anthony", lastName: "Wood", title: "Founder", email: "anthony@roku.com", status: "Lead", company: "roku" },
    { key: "drew", firstName: "Drew", lastName: "Houston", title: "CEO", email: "drew@dropbox.com", status: "Active", company: "dropbox" },
    { key: "alex", firstName: "Alex", lastName: "Zaccaria", title: "CEO", email: "alex@linktree.com", status: "Active", company: "linktree" },
    { key: "joe", firstName: "Joe", lastName: "Thomas", title: "CEO", email: "joe@loom.com", status: "Lead", company: "loom" },
    { key: "brian", firstName: "Brian", lastName: "Chesky", title: "CEO", email: "brian@airbnb.com", status: "Active", company: "airbnb" },
    { key: "nima", firstName: "Nima", lastName: "Gardideh", title: "Co-founder", email: "nima@finofo.com", status: "Lead", company: "finofo" },
    { key: "dennis", firstName: "Dennis", lastName: "Mueller", title: "CEO", email: "dennis@amie.com", status: "Lead", company: "amie" },
  ];

  const contacts: Record<string, string> = {};
  for (const c of contactData) {
    const { key, company, ...rest } = c;
    const created = await prisma.contact.create({
      data: { ...rest, companyId: companies[company] ?? null, ownerId },
    });
    contacts[key] = created.id;
  }

  // Associated deals (named after the company, like the screenshot).
  const dealData = [
    { key: "shopify", title: "Shopify", value: 540000, stage: "Negotiation", company: "shopify", contact: "harley", closeInDays: 18 },
    { key: "stripe", title: "Stripe", value: 720000, stage: "Qualified", company: "stripe", contact: "patrick", closeInDays: 40 },
    { key: "adobe", title: "Adobe", value: 880000, stage: "Proposal", company: "adobe", contact: "shantanu", closeInDays: 25 },
    { key: "adobe-creative", title: "Adobe - Creative", value: 220000, stage: "Lead", company: "adobe", contact: "shantanu", closeInDays: 55 },
    { key: "miro", title: "Miro", value: 1020000, stage: "Qualified", company: "miro", contact: "andrey", closeInDays: 35 },
    { key: "zoom", title: "Zoom", value: 1180000, stage: "Won", company: "zoom", contact: "eric", closeInDays: -8 },
    { key: "roku", title: "Roku", value: 1320000, stage: "Lead", company: "roku", contact: "anthony", closeInDays: 60 },
    { key: "dropbox", title: "Dropbox", value: 1500000, stage: "Proposal", company: "dropbox", contact: "drew", closeInDays: 20 },
    { key: "linktree", title: "Linktree", value: 1700000, stage: "Negotiation", company: "linktree", contact: "alex", closeInDays: 12 },
    { key: "loom", title: "Loom", value: 1900000, stage: "Qualified", company: "loom", contact: "joe", closeInDays: 45 },
    { key: "airbnb", title: "Airbnb", value: 2100000, stage: "Won", company: "airbnb", contact: "brian", closeInDays: -15 },
    { key: "finofo", title: "Finofo", value: 2350000, stage: "Lead", company: "finofo", contact: "nima", closeInDays: 50 },
    { key: "amie", title: "Amie", value: 2600000, stage: "Proposal", company: "amie", contact: "dennis", closeInDays: 30 },
  ];

  const deals: Record<string, string> = {};
  let order = 0;
  for (const d of dealData) {
    const { key, contact, company, closeInDays, ...rest } = d;
    const created = await prisma.deal.create({
      data: {
        ...rest,
        status: statusForStage(rest.stage),
        order: order++,
        closeDate: closeInDays != null ? addDays(new Date(), closeInDays) : null,
        contactId: contacts[contact] ?? null,
        companyId: companies[company] ?? null,
        ownerId,
      },
    });
    deals[key] = created.id;
  }

  const activityData = [
    { type: "Call", title: "Discovery call with Harley", contact: "harley", deal: "shopify", dueInDays: -3, completed: true },
    { type: "Email", title: "Send Stripe proposal", contact: "patrick", deal: "stripe", dueInDays: 1, completed: false },
    { type: "Meeting", title: "Adobe Creative scoping", contact: "shantanu", deal: "adobe-creative", dueInDays: 2, completed: false },
    { type: "Task", title: "Follow up with Miro", contact: "andrey", deal: "miro", dueInDays: -1, completed: false },
    { type: "Meeting", title: "Dropbox security review", contact: "drew", deal: "dropbox", dueInDays: 0, completed: false },
    { type: "Note", title: "Linktree wants annual billing", contact: "alex", deal: "linktree", completed: false },
    { type: "Email", title: "Zoom onboarding kickoff", contact: "eric", deal: "zoom", dueInDays: -6, completed: true },
    { type: "Task", title: "Prepare Q3 pipeline report", dueInDays: 4, completed: false },
    { type: "Call", title: "Reconnect with Loom", contact: "joe", deal: "loom", dueInDays: 7, completed: false },
    { type: "Meeting", title: "Airbnb integration handoff", contact: "brian", deal: "airbnb", dueInDays: -10, completed: true },
    { type: "Task", title: "Clean up duplicate records", dueInDays: 3, completed: false },
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

  console.log(`Seeded demo workspace for ${DEMO_EMAIL} (password: password123)`);
  console.log({
    companies: companyData.length,
    contacts: contactData.length,
    deals: dealData.length,
    activities: activityData.length,
  });
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
