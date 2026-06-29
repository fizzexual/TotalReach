import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import { decryptSecret } from "@/lib/crypto";

export type MailConfig = { host: string; port: number; secure: boolean; user: string; pass: string; from: string };
export type SendResult = { ok: boolean; skipped?: boolean; error?: string };

/** Public base URL used for tracking pixels (no trailing slash). */
export function appUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

function envConfig(): MailConfig | null {
  if (!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  return {
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
  };
}

/** The connected email account for this user (DB first, then env fallback). */
export async function getEmailConfig(ownerId: string): Promise<MailConfig | null> {
  const s = await prisma.emailSettings.findUnique({ where: { ownerId } });
  if (s) {
    return {
      host: s.host,
      port: s.port,
      secure: s.secure,
      user: s.username,
      pass: decryptSecret(s.passwordEnc),
      from: s.fromName ? `${s.fromName} <${s.fromEmail}>` : s.fromEmail,
    };
  }
  return envConfig();
}

export async function mailStatusFor(
  ownerId: string,
): Promise<{ configured: boolean; from?: string; source?: "account" | "env" }> {
  const s = await prisma.emailSettings.findUnique({ where: { ownerId }, select: { fromEmail: true, fromName: true } });
  if (s) return { configured: true, source: "account", from: s.fromName ? `${s.fromName} <${s.fromEmail}>` : s.fromEmail };
  const env = envConfig();
  if (env) return { configured: true, source: "env", from: env.from };
  return { configured: false };
}

function transportFrom(cfg: MailConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}

export async function sendMailFor(
  ownerId: string,
  opts: { to: string; subject: string; html: string },
): Promise<SendResult> {
  const cfg = await getEmailConfig(ownerId);
  if (!cfg) return { ok: false, skipped: true, error: "No email account connected" };
  try {
    await transportFrom(cfg).sendMail({ from: cfg.from, to: opts.to, subject: opts.subject, html: opts.html });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Send failed" };
  }
}

export async function verifyConfig(cfg: MailConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    await transportFrom(cfg).verify();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Connection failed" };
  }
}
