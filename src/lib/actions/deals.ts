"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fieldErrors, optionalText, optionalDate, toNumber, type FormState } from "@/lib/validation";
import { DEAL_STAGES } from "@/lib/constants";
import { runAutomationsForTrigger } from "@/lib/automation-engine";

const schema = z.object({
  title: z.string().trim().min(1, "Deal name is required").max(160),
});

function normalizeStage(v: FormDataEntryValue | null): string {
  const s = typeof v === "string" ? v : "";
  return (DEAL_STAGES as readonly string[]).includes(s) ? s : "Lead";
}

function statusForStage(stage: string): string {
  return stage === "Won" ? "Won" : stage === "Lost" ? "Lost" : "Open";
}

async function resolveContactId(ownerId: string, v: FormDataEntryValue | null) {
  const id = typeof v === "string" && v.trim() ? v.trim() : null;
  if (!id) return null;
  const c = await prisma.contact.findFirst({ where: { id, ownerId }, select: { id: true } });
  return c?.id ?? null;
}

async function resolveCompanyId(ownerId: string, v: FormDataEntryValue | null) {
  const id = typeof v === "string" && v.trim() ? v.trim() : null;
  if (!id) return null;
  const c = await prisma.company.findFirst({ where: { id, ownerId }, select: { id: true } });
  return c?.id ?? null;
}

async function fireWon(ownerId: string, dealId: string) {
  try {
    await runAutomationsForTrigger(ownerId, "deal_won", { dealId });
  } catch {
    // ignore automation errors
  }
}

export async function createDeal(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const stage = normalizeStage(formData.get("stage"));
  const contactId = await resolveContactId(user.id, formData.get("contactId"));
  const companyId = await resolveCompanyId(user.id, formData.get("companyId"));
  const agg = await prisma.deal.aggregate({ where: { ownerId: user.id, stage }, _max: { order: true } });

  const created = await prisma.deal.create({
    data: {
      title: parsed.data.title,
      value: toNumber(formData.get("value")),
      stage,
      status: statusForStage(stage),
      closeDate: optionalDate(formData.get("closeDate")),
      notes: optionalText(formData.get("notes")),
      contactId,
      companyId,
      ownerId: user.id,
      order: (agg._max.order ?? 0) + 1,
    },
  });

  try {
    await runAutomationsForTrigger(user.id, "deal_created", { dealId: created.id });
  } catch {
    // ignore automation errors
  }
  if (stage === "Won") await fireWon(user.id, created.id);

  revalidatePath("/deals");
  revalidatePath("/dashboard");
  revalidatePath("/emails");
  return { ok: true };
}

export async function updateDeal(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.deal.findFirst({
    where: { id, ownerId: user.id },
    select: { id: true, stage: true, order: true },
  });
  if (!existing) return { error: "Deal not found." };

  const parsed = schema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const stage = normalizeStage(formData.get("stage"));
  const contactId = await resolveContactId(user.id, formData.get("contactId"));
  const companyId = await resolveCompanyId(user.id, formData.get("companyId"));

  let order = existing.order;
  if (stage !== existing.stage) {
    const agg = await prisma.deal.aggregate({ where: { ownerId: user.id, stage }, _max: { order: true } });
    order = (agg._max.order ?? 0) + 1;
  }

  await prisma.deal.update({
    where: { id },
    data: {
      title: parsed.data.title,
      value: toNumber(formData.get("value")),
      stage,
      status: statusForStage(stage),
      closeDate: optionalDate(formData.get("closeDate")),
      notes: optionalText(formData.get("notes")),
      contactId,
      companyId,
      order,
    },
  });

  if (stage === "Won" && existing.stage !== "Won") await fireWon(user.id, id);

  revalidatePath("/deals");
  revalidatePath("/dashboard");
  revalidatePath("/emails");
  return { ok: true };
}

export async function moveDeal(id: string, toStage: string, orderedIds: string[]) {
  const user = await requireUser();
  const stage = (DEAL_STAGES as readonly string[]).includes(toStage) ? toStage : "Lead";

  const owned = await prisma.deal.findFirst({ where: { id, ownerId: user.id }, select: { id: true, stage: true } });
  if (!owned) return;

  await prisma.deal.update({ where: { id }, data: { stage, status: statusForStage(stage) } });

  const owns = await prisma.deal.findMany({
    where: { ownerId: user.id, id: { in: orderedIds } },
    select: { id: true },
  });
  const ownedSet = new Set(owns.map((o) => o.id));

  await prisma.$transaction(
    orderedIds
      .filter((x) => ownedSet.has(x))
      .map((dealId, index) => prisma.deal.update({ where: { id: dealId }, data: { order: index } })),
  );

  if (stage === "Won" && owned.stage !== "Won") await fireWon(user.id, id);

  revalidatePath("/deals");
  revalidatePath("/dashboard");
  revalidatePath("/emails");
}

export async function deleteDeal(id: string) {
  const user = await requireUser();
  await prisma.deal.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/deals");
  revalidatePath("/dashboard");
}
