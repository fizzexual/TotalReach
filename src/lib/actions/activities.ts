"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fieldErrors, optionalText, optionalDate, type FormState } from "@/lib/validation";
import { ACTIVITY_TYPES } from "@/lib/constants";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
});

function normalizeType(v: FormDataEntryValue | null): string {
  const s = typeof v === "string" ? v : "";
  return (ACTIVITY_TYPES as readonly string[]).includes(s) ? s : "Note";
}

async function ownContactId(ownerId: string, v: FormDataEntryValue | null): Promise<string | null> {
  const id = typeof v === "string" && v.trim() ? v.trim() : null;
  if (!id) return null;
  const c = await prisma.contact.findFirst({ where: { id, ownerId }, select: { id: true } });
  return c?.id ?? null;
}

async function ownDealId(ownerId: string, v: FormDataEntryValue | null): Promise<string | null> {
  const id = typeof v === "string" && v.trim() ? v.trim() : null;
  if (!id) return null;
  const d = await prisma.deal.findFirst({ where: { id, ownerId }, select: { id: true } });
  return d?.id ?? null;
}

async function ownCompanyId(ownerId: string, v: FormDataEntryValue | null): Promise<string | null> {
  const id = typeof v === "string" && v.trim() ? v.trim() : null;
  if (!id) return null;
  const c = await prisma.company.findFirst({ where: { id, ownerId }, select: { id: true } });
  return c?.id ?? null;
}

function revalidateActivityPaths(opts: { contactId?: string | null; dealId?: string | null }) {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (opts.contactId) revalidatePath(`/contacts/${opts.contactId}`);
  if (opts.dealId) revalidatePath(`/deals/${opts.dealId}`);
  revalidatePath("/deals");
}

export async function createActivity(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const contactId = await ownContactId(user.id, formData.get("contactId"));
  const dealId = await ownDealId(user.id, formData.get("dealId"));
  const companyId = await ownCompanyId(user.id, formData.get("companyId"));

  await prisma.activity.create({
    data: {
      title: parsed.data.title,
      type: normalizeType(formData.get("type")),
      notes: optionalText(formData.get("notes")),
      dueDate: optionalDate(formData.get("dueDate")),
      contactId,
      dealId,
      companyId,
      ownerId: user.id,
    },
  });

  revalidateActivityPaths({ contactId, dealId });
  return { ok: true };
}

export async function toggleActivity(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const activity = await prisma.activity.findFirst({
    where: { id, ownerId: user.id },
    select: { id: true, completed: true, contactId: true, dealId: true },
  });
  if (!activity) return;
  const completed = !activity.completed;
  await prisma.activity.update({
    where: { id },
    data: { completed, completedAt: completed ? new Date() : null },
  });
  revalidateActivityPaths({ contactId: activity.contactId, dealId: activity.dealId });
}

export async function deleteActivity(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const activity = await prisma.activity.findFirst({
    where: { id, ownerId: user.id },
    select: { contactId: true, dealId: true },
  });
  await prisma.activity.deleteMany({ where: { id, ownerId: user.id } });
  revalidateActivityPaths({ contactId: activity?.contactId, dealId: activity?.dealId });
}
