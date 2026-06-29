"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fieldErrors, optionalText, type FormState } from "@/lib/validation";
import { TRIGGERS, ACTIONS, getTrigger, getAction } from "@/lib/automation";
import { executeAutomation } from "@/lib/automation-engine";

const nameSchema = z.object({ name: z.string().trim().min(1, "Name is required").max(120) });

function validTrigger(v: FormDataEntryValue | null): string {
  const s = typeof v === "string" ? v : "";
  return s in TRIGGERS ? s : "email_opened";
}
function validAction(v: FormDataEntryValue | null): string {
  const s = typeof v === "string" ? v : "";
  return s in ACTIONS ? s : "send_email";
}

async function ownAutomation(ownerId: string, id: string) {
  return prisma.automation.findFirst({ where: { id, ownerId }, select: { id: true } });
}

/* ---------------- Automations ---------------- */

export async function createAutomation(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = nameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const triggerType = validTrigger(formData.get("triggerType"));
  const created = await prisma.automation.create({
    data: {
      name: parsed.data.name,
      description: optionalText(formData.get("description")),
      triggerType,
      triggerLabel: getTrigger(triggerType).label,
      ownerId: user.id,
    },
  });
  revalidatePath("/automation");
  redirect(`/automation/${created.id}`);
}

export async function updateAutomation(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!(await ownAutomation(user.id, id))) return { error: "Automation not found." };

  const parsed = nameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const triggerType = validTrigger(formData.get("triggerType"));
  await prisma.automation.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: optionalText(formData.get("description")),
      triggerType,
      triggerLabel: getTrigger(triggerType).label,
    },
  });
  revalidatePath("/automation");
  revalidatePath(`/automation/${id}`);
  return { ok: true };
}

export async function toggleAutomation(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const automation = await prisma.automation.findFirst({ where: { id, ownerId: user.id }, select: { id: true, enabled: true } });
  if (!automation) return;
  await prisma.automation.update({ where: { id }, data: { enabled: !automation.enabled } });
  revalidatePath("/automation");
  revalidatePath(`/automation/${id}`);
}

export async function deleteAutomation(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.automation.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/automation");
  redirect("/automation");
}

/* ---------------- Steps ---------------- */

export async function addStep(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const automationId = String(formData.get("automationId") ?? "");
  if (!(await ownAutomation(user.id, automationId))) return { error: "Automation not found." };

  const kind = formData.get("kind") === "Condition" ? "Condition" : "Action";
  const agg = await prisma.automationStep.aggregate({ where: { automationId }, _max: { order: true } });
  const order = (agg._max.order ?? -1) + 1;

  if (kind === "Condition") {
    const field = optionalText(formData.get("condField")) ?? "Email opened";
    const operator = optionalText(formData.get("condOperator")) ?? "is";
    const value = optionalText(formData.get("condValue")) ?? "true";
    await prisma.automationStep.create({
      data: {
        automationId,
        order,
        kind,
        type: "condition",
        title: optionalText(formData.get("title")) ?? "Condition",
        subtitle: optionalText(formData.get("subtitle")) ?? `If ${field} ${operator} ${value}`,
        condField: field,
        condOperator: operator,
        condValue: value,
      },
    });
  } else {
    const type = validAction(formData.get("type"));
    await prisma.automationStep.create({
      data: {
        automationId,
        order,
        kind,
        type,
        title: optionalText(formData.get("title")) ?? getAction(type).label,
        subtitle: optionalText(formData.get("subtitle")) ?? getAction(type).defaultSubtitle,
        emailSubject: optionalText(formData.get("emailSubject")),
        emailBody: optionalText(formData.get("emailBody")),
      },
    });
  }

  revalidatePath(`/automation/${automationId}`);
  return { ok: true };
}

export async function updateStep(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const step = await prisma.automationStep.findFirst({
    where: { id, automation: { ownerId: user.id } },
    select: { id: true, automationId: true, kind: true },
  });
  if (!step) return { error: "Step not found." };

  if (step.kind === "Condition") {
    const field = optionalText(formData.get("condField")) ?? "Email opened";
    const operator = optionalText(formData.get("condOperator")) ?? "is";
    const value = optionalText(formData.get("condValue")) ?? "true";
    await prisma.automationStep.update({
      where: { id },
      data: {
        title: optionalText(formData.get("title")) ?? "Condition",
        subtitle: optionalText(formData.get("subtitle")) ?? `If ${field} ${operator} ${value}`,
        condField: field,
        condOperator: operator,
        condValue: value,
      },
    });
  } else {
    const type = validAction(formData.get("type"));
    await prisma.automationStep.update({
      where: { id },
      data: {
        type,
        title: optionalText(formData.get("title")) ?? getAction(type).label,
        subtitle: optionalText(formData.get("subtitle")) ?? getAction(type).defaultSubtitle,
        emailSubject: optionalText(formData.get("emailSubject")),
        emailBody: optionalText(formData.get("emailBody")),
      },
    });
  }

  revalidatePath(`/automation/${step.automationId}`);
  return { ok: true };
}

export async function deleteStep(id: string) {
  const user = await requireUser();
  const step = await prisma.automationStep.findFirst({
    where: { id, automation: { ownerId: user.id } },
    select: { automationId: true },
  });
  if (!step) return;
  await prisma.automationStep.delete({ where: { id } });
  revalidatePath(`/automation/${step.automationId}`);
}

export async function moveStep(stepId: string, direction: "up" | "down") {
  const user = await requireUser();
  const step = await prisma.automationStep.findFirst({
    where: { id: stepId, automation: { ownerId: user.id } },
    select: { id: true, order: true, automationId: true },
  });
  if (!step) return;
  const neighbor = await prisma.automationStep.findFirst({
    where: {
      automationId: step.automationId,
      order: direction === "up" ? { lt: step.order } : { gt: step.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
    select: { id: true, order: true },
  });
  if (!neighbor) return;
  await prisma.$transaction([
    prisma.automationStep.update({ where: { id: step.id }, data: { order: neighbor.order } }),
    prisma.automationStep.update({ where: { id: neighbor.id }, data: { order: step.order } }),
  ]);
  revalidatePath(`/automation/${step.automationId}`);
}

export async function runNow(automationId: string, recipientEmail: string) {
  const user = await requireUser();
  if (!(await ownAutomation(user.id, automationId))) return;
  const to = recipientEmail?.trim() || user.email;
  await executeAutomation(automationId, user.id, { recipientOverride: to, recipientName: user.name });
  revalidatePath(`/automation/${automationId}`);
  revalidatePath("/emails");
}

export async function resetRun(automationId: string) {
  const user = await requireUser();
  if (!(await ownAutomation(user.id, automationId))) return;
  await prisma.automation.update({ where: { id: automationId }, data: { lastRunAt: null } });
  await prisma.automationStep.updateMany({ where: { automationId }, data: { status: "Idle" } });
  revalidatePath(`/automation/${automationId}`);
}
