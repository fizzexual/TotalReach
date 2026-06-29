import { prisma } from "@/lib/db";
import { sendMailFor, appUrl } from "@/lib/mailer";

type Ctx = {
  contactId?: string;
  dealId?: string;
  emailOpened?: boolean;
  recipientOverride?: string;
  recipientName?: string;
};

type ContactLite = { id: string; firstName: string; lastName: string; email: string | null; status: string } | null;
type DealLite = { value: number; stage: string; contact: { firstName: string; lastName: string; email: string | null } | null; company: { icpFit: string | null } | null } | null;

type StepLite = {
  id: string;
  kind: string;
  type: string;
  title: string;
  subtitle: string | null;
  emailSubject: string | null;
  emailBody: string | null;
  condField: string | null;
  condOperator: string | null;
  condValue: string | null;
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function renderEmailHtml(body: string, name: string, token: string) {
  const safe = escapeHtml(body || "Thanks for your interest — here's a quick follow-up.").replace(/\n/g, "<br>");
  const pixel = `<img src="${appUrl()}/api/track/open/${token}" width="1" height="1" alt="" style="display:none" />`;
  return `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111;line-height:1.6;margin:0;padding:16px">
<p>Hi ${escapeHtml(name)},</p>
<p>${safe}</p>
<p style="color:#777;font-size:13px;margin-top:24px">— Sent by TotalReach CRM</p>
${pixel}
</body></html>`;
}

function compare(actual: string | number, op: string, target: string): boolean {
  const a = String(actual).toLowerCase();
  const t = String(target).toLowerCase();
  const an = Number(actual);
  const tn = Number(target);
  switch (op) {
    case "is": return a === t;
    case "is not": return a !== t;
    case "greater than": return Number.isFinite(an) && Number.isFinite(tn) && an > tn;
    case "less than": return Number.isFinite(an) && Number.isFinite(tn) && an < tn;
    case "contains": return a.includes(t);
    default: return true;
  }
}

function evaluateCondition(step: StepLite, data: { contact: ContactLite; deal: DealLite; emailOpened?: boolean }): boolean {
  const field = step.condField ?? "";
  const op = step.condOperator ?? "is";
  const target = step.condValue ?? "";
  let actual: string | number | null = null;
  switch (field) {
    case "Email opened": actual = data.emailOpened ? "true" : "false"; break;
    case "Deal value": actual = data.deal?.value ?? null; break;
    case "Deal stage": actual = data.deal?.stage ?? null; break;
    case "Person status": actual = data.contact?.status ?? null; break;
    case "Company ICP fit": actual = data.deal?.company?.icpFit ?? null; break;
    default: actual = null;
  }
  if (actual === null) return true; // lenient when the field isn't in context
  return compare(actual, op, target);
}

async function performAction(
  step: StepLite,
  p: { ownerId: string; automationId: string; contactId: string | null; recipientEmail: string | null; recipientName: string },
) {
  if (step.type === "send_email") {
    const subject = step.emailSubject || step.title || "A note from TotalReach";
    const body = step.emailBody || step.subtitle || "";
    if (!p.recipientEmail) {
      await prisma.emailMessage.create({
        data: { ownerId: p.ownerId, automationId: p.automationId, contactId: p.contactId, to: "(no recipient)", subject, body, status: "skipped", error: "No recipient email", source: "automation" },
      });
      return;
    }
    const msg = await prisma.emailMessage.create({
      data: { ownerId: p.ownerId, automationId: p.automationId, contactId: p.contactId, to: p.recipientEmail, subject, body, status: "queued", source: "automation" },
    });
    const res = await sendMailFor(p.ownerId, { to: p.recipientEmail, subject, html: renderEmailHtml(body, p.recipientName, msg.trackToken) });
    await prisma.emailMessage.update({
      where: { id: msg.id },
      data: { status: res.ok ? "sent" : res.skipped ? "skipped" : "failed", error: res.error ?? null },
    });
    return;
  }

  if (step.type === "create_task") {
    await prisma.activity.create({
      data: { ownerId: p.ownerId, type: "Task", title: step.title || "Follow-up task", notes: step.subtitle ?? null, contactId: p.contactId },
    });
    return;
  }

  // add_to_list / update_field / notify_team — record a visible activity.
  await prisma.activity.create({
    data: { ownerId: p.ownerId, type: "Note", title: step.title || "Automation action", notes: step.subtitle ?? null, contactId: p.contactId },
  });
}

export async function executeAutomation(automationId: string, ownerId: string, ctx: Ctx) {
  const automation = await prisma.automation.findFirst({
    where: { id: automationId, ownerId },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  if (!automation) return { ok: false, ran: 0 };

  const contact: ContactLite = ctx.contactId
    ? await prisma.contact.findFirst({ where: { id: ctx.contactId, ownerId }, select: { id: true, firstName: true, lastName: true, email: true, status: true } })
    : null;
  const deal: DealLite = ctx.dealId
    ? await prisma.deal.findFirst({
        where: { id: ctx.dealId, ownerId },
        select: { value: true, stage: true, contact: { select: { firstName: true, lastName: true, email: true } }, company: { select: { icpFit: true } } },
      })
    : null;

  const recipientEmail = ctx.recipientOverride || contact?.email || deal?.contact?.email || null;
  const recipientName =
    ctx.recipientName ||
    (contact ? `${contact.firstName} ${contact.lastName}` : deal?.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : "there");

  await prisma.automation.update({ where: { id: automation.id }, data: { lastRunAt: new Date() } });

  const executed: string[] = [];
  for (const step of automation.steps) {
    if (step.kind === "Condition") {
      if (!evaluateCondition(step, { contact, deal, emailOpened: ctx.emailOpened })) break;
      executed.push(step.id);
      continue;
    }
    await performAction(step, {
      ownerId,
      automationId: automation.id,
      contactId: contact?.id ?? null,
      recipientEmail,
      recipientName,
    });
    executed.push(step.id);
  }

  await prisma.automationStep.updateMany({ where: { automationId: automation.id, id: { in: executed } }, data: { status: "Completed" } });
  const skipped = automation.steps.filter((s) => !executed.includes(s.id)).map((s) => s.id);
  if (skipped.length) {
    await prisma.automationStep.updateMany({ where: { id: { in: skipped } }, data: { status: "Idle" } });
  }
  return { ok: true, ran: executed.length };
}

/** Fire all enabled automations for the given owner + trigger type. */
export async function runAutomationsForTrigger(ownerId: string, triggerType: string, ctx: Ctx) {
  const automations = await prisma.automation.findMany({
    where: { ownerId, triggerType, enabled: true },
    select: { id: true },
  });
  for (const a of automations) {
    try {
      await executeAutomation(a.id, ownerId, ctx);
    } catch {
      // never let an automation failure break the triggering action
    }
  }
}
