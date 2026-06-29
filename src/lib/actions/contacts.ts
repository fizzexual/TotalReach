"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fieldErrors, optionalText, emailRegex, type FormState } from "@/lib/validation";
import { CONTACT_STATUSES } from "@/lib/constants";
import { runAutomationsForTrigger } from "@/lib/automation-engine";

const nameSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
});

function normalizeStatus(v: FormDataEntryValue | null): string {
  const s = typeof v === "string" ? v : "";
  return (CONTACT_STATUSES as readonly string[]).includes(s) ? s : "Lead";
}

async function resolveCompanyId(ownerId: string, v: FormDataEntryValue | null): Promise<string | null> {
  const id = typeof v === "string" && v.trim() ? v.trim() : null;
  if (!id) return null;
  const c = await prisma.company.findFirst({ where: { id, ownerId }, select: { id: true } });
  return c?.id ?? null;
}

function readInput(formData: FormData) {
  return {
    email: optionalText(formData.get("email")),
    phone: optionalText(formData.get("phone")),
    title: optionalText(formData.get("title")),
    notes: optionalText(formData.get("notes")),
    status: normalizeStatus(formData.get("status")),
  };
}

export async function createContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = nameSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const input = readInput(formData);
  if (input.email && !emailRegex.test(input.email)) return { fieldErrors: { email: "Enter a valid email" } };

  const companyId = await resolveCompanyId(user.id, formData.get("companyId"));
  const created = await prisma.contact.create({ data: { ...parsed.data, ...input, companyId, ownerId: user.id } });

  try {
    await runAutomationsForTrigger(user.id, "contact_created", { contactId: created.id });
  } catch {
    // automation failures must not break contact creation
  }

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  revalidatePath("/emails");
  return { ok: true };
}

export async function updateContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.contact.findFirst({ where: { id, ownerId: user.id }, select: { id: true } });
  if (!existing) return { error: "Contact not found." };

  const parsed = nameSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const input = readInput(formData);
  if (input.email && !emailRegex.test(input.email)) return { fieldErrors: { email: "Enter a valid email" } };

  const companyId = await resolveCompanyId(user.id, formData.get("companyId"));
  await prisma.contact.update({ where: { id }, data: { ...parsed.data, ...input, companyId } });

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteContact(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.contact.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  redirect("/contacts");
}
