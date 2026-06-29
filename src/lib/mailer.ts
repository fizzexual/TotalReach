import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null | undefined;

/** True when SMTP credentials are present in the environment. */
export function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransport(): Transporter | null {
  if (cached !== undefined) return cached;
  if (!mailConfigured()) {
    cached = null;
    return null;
  }
  const port = Number(process.env.SMTP_PORT || 587);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return cached;
}

export function emailFrom(): string {
  return process.env.EMAIL_FROM || process.env.SMTP_USER || "no-reply@totalreach.app";
}

/** The public base URL used for tracking pixels (no trailing slash). */
export function appUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export type SendResult = { ok: boolean; skipped?: boolean; error?: string };

export async function sendMail(opts: { to: string; subject: string; html: string }): Promise<SendResult> {
  const transport = getTransport();
  if (!transport) return { ok: false, skipped: true, error: "SMTP not configured" };
  try {
    await transport.sendMail({ from: emailFrom(), to: opts.to, subject: opts.subject, html: opts.html });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Send failed" };
  }
}
