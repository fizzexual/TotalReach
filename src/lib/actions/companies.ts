"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fieldErrors, optionalText, type FormState } from "@/lib/validation";
import { ICP_FITS, CONNECTION_STRENGTHS } from "@/lib/constants";

const schema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(120),
});

function normalizeEnum(v: FormDataEntryValue | null, allowed: readonly string[]): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return allowed.includes(s) ? s : null;
}

function readInput(formData: FormData) {
  return {
    domain: optionalText(formData.get("domain")),
    industry: optionalText(formData.get("industry")),
    website: optionalText(formData.get("website")),
    phone: optionalText(formData.get("phone")),
    location: optionalText(formData.get("location")),
    notes: optionalText(formData.get("notes")),
    icpFit: normalizeEnum(formData.get("icpFit"), ICP_FITS),
    estimatedArr: optionalText(formData.get("estimatedArr")),
    connectionStrength: normalizeEnum(formData.get("connectionStrength"), CONNECTION_STRENGTHS),
  };
}

export async function createCompany(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  await prisma.company.create({ data: { name: parsed.data.name, ...readInput(formData), ownerId: user.id } });
  revalidatePath("/companies");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateCompany(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.company.findFirst({ where: { id, ownerId: user.id }, select: { id: true } });
  if (!existing) return { error: "Company not found." };

  const parsed = schema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  await prisma.company.update({ where: { id }, data: { name: parsed.data.name, ...readInput(formData) } });
  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  return { ok: true };
}

export async function deleteCompany(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.company.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/companies");
  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  redirect("/companies");
}
