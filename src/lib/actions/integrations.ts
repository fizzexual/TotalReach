"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fieldErrors, optionalText, emailRegex, type FormState } from "@/lib/validation";
import { encryptSecret, decryptSecret } from "@/lib/crypto";
import { verifyConfig, sendMailFor, appUrl, type MailConfig } from "@/lib/mailer";

const schema = z.object({
  host: z.string().trim().min(1, "SMTP host is required").max(200),
  username: z.string().trim().min(1, "Username is required").max(200),
  fromEmail: z.string().trim().min(1, "From email is required").regex(emailRegex, "Enter a valid email"),
});

export async function saveEmailSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse({
    host: formData.get("host"),
    username: formData.get("username"),
    fromEmail: formData.get("fromEmail"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const port = Number(formData.get("port")) || 587;
  const secure = formData.get("secure") === "on" || port === 465;
  const fromName = optionalText(formData.get("fromName"));
  const passwordInput = typeof formData.get("password") === "string" ? String(formData.get("password")).trim() : "";

  const existing = await prisma.emailSettings.findUnique({ where: { ownerId: user.id } });
  if (!passwordInput && !existing) return { fieldErrors: { password: "Password is required" } };

  const passwordEnc = passwordInput ? encryptSecret(passwordInput) : existing!.passwordEnc;
  const plainPass = passwordInput || (existing ? decryptSecret(existing.passwordEnc) : "");

  const cfg: MailConfig = {
    host: parsed.data.host,
    port,
    secure,
    user: parsed.data.username,
    pass: plainPass,
    from: fromName ? `${fromName} <${parsed.data.fromEmail}>` : parsed.data.fromEmail,
  };
  const verify = await verifyConfig(cfg);

  const data = {
    host: parsed.data.host,
    port,
    secure,
    username: parsed.data.username,
    passwordEnc,
    fromName,
    fromEmail: parsed.data.fromEmail,
    verified: verify.ok,
  };
  await prisma.emailSettings.upsert({
    where: { ownerId: user.id },
    create: { ownerId: user.id, ...data },
    update: data,
  });

  revalidatePath("/integrations");
  revalidatePath("/emails");
  return verify.ok ? { ok: true } : { ok: true, error: `Saved, but the connection test failed: ${verify.error}` };
}

export async function disconnectEmail(formData: FormData) {
  const user = await requireUser();
  void formData;
  await prisma.emailSettings.deleteMany({ where: { ownerId: user.id } });
  revalidatePath("/integrations");
  revalidatePath("/emails");
}

export async function sendTestEmail(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const to = optionalText(formData.get("to")) || user.email;
  if (!emailRegex.test(to)) return { fieldErrors: { to: "Enter a valid email" } };

  const subject = "TotalReach test email";
  const body = "This is a test email from your TotalReach workspace. If you received it, your email connection is working.";
  const msg = await prisma.emailMessage.create({
    data: { ownerId: user.id, to, subject, body, status: "queued", source: "test" },
  });
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;font-size:15px;color:#111;line-height:1.6;padding:16px">
<p>${body}</p>
<p style="color:#777;font-size:13px">— TotalReach CRM</p>
<img src="${appUrl()}/api/track/open/${msg.trackToken}" width="1" height="1" alt="" style="display:none" />
</body></html>`;
  const res = await sendMailFor(user.id, { to, subject, html });
  await prisma.emailMessage.update({
    where: { id: msg.id },
    data: { status: res.ok ? "sent" : res.skipped ? "skipped" : "failed", error: res.error ?? null },
  });

  revalidatePath("/emails");
  return res.ok ? { ok: true } : { error: res.error ?? "Send failed" };
}
