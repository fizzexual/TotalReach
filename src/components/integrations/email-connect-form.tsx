"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, FormError, Input } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { ConfirmButton } from "@/components/confirm-button";
import { saveEmailSettings, sendTestEmail, disconnectEmail } from "@/lib/actions/integrations";
import type { FormState } from "@/lib/validation";

type Settings = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromName: string | null;
  fromEmail: string;
} | null;

function Ok({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
      {children}
    </div>
  );
}

export function EmailConnectForm({ settings, defaultEmail }: { settings: Settings; defaultEmail: string }) {
  const [saveState, saveAction] = useActionState<FormState, FormData>(saveEmailSettings, {});
  const [testState, testAction] = useActionState<FormState, FormData>(sendTestEmail, {});
  const router = useRouter();

  React.useEffect(() => {
    if (saveState.ok) router.refresh();
  }, [saveState, router]);

  return (
    <div className="space-y-5">
      <form action={saveAction} className="space-y-4">
        {saveState.ok && !saveState.error && <Ok>Email connection saved.</Ok>}
        {saveState.error && <FormError>{saveState.error}</FormError>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="SMTP host" htmlFor="host" error={saveState.fieldErrors?.host}>
            <Input id="host" name="host" defaultValue={settings?.host ?? "smtp.gmail.com"} placeholder="smtp.gmail.com" required />
          </Field>
          <Field label="Port" htmlFor="port">
            <Input id="port" name="port" type="number" defaultValue={settings?.port ?? 587} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Username" htmlFor="username" error={saveState.fieldErrors?.username}>
            <Input id="username" name="username" defaultValue={settings?.username ?? ""} placeholder="you@gmail.com" required />
          </Field>
          <Field label="Password / App password" htmlFor="password" error={saveState.fieldErrors?.password}>
            <Input id="password" name="password" type="password" placeholder={settings ? "•••••••• (unchanged)" : "App password"} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="From name" htmlFor="fromName">
            <Input id="fromName" name="fromName" defaultValue={settings?.fromName ?? "TotalReach"} />
          </Field>
          <Field label="From email" htmlFor="fromEmail" error={saveState.fieldErrors?.fromEmail}>
            <Input id="fromEmail" name="fromEmail" type="email" defaultValue={settings?.fromEmail ?? ""} placeholder="you@gmail.com" required />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <input type="checkbox" name="secure" defaultChecked={settings?.secure ?? false} className="h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-500" />
          Use TLS/SSL (port 465)
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton>Save &amp; connect</SubmitButton>
          <span className="text-xs text-zinc-500">The password is encrypted before it&apos;s stored.</span>
        </div>
      </form>

      <div className="border-t border-white/[0.07] pt-5">
        <p className="mb-2 text-sm font-medium text-zinc-300">Send a test email</p>
        {testState.ok && <div className="mb-2"><Ok>Test email sent — check the Emails log and your inbox.</Ok></div>}
        {testState.error && <div className="mb-2"><FormError>{testState.error}</FormError></div>}
        <form action={testAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Field label="Recipient" htmlFor="to" className="flex-1" error={testState.fieldErrors?.to}>
            <Input id="to" name="to" type="email" defaultValue={defaultEmail} />
          </Field>
          <SubmitButton variant="secondary">Send test</SubmitButton>
        </form>
      </div>

      {settings && (
        <form action={disconnectEmail} className="border-t border-white/[0.07] pt-5">
          <ConfirmButton type="submit" variant="ghost" className="text-rose-400 hover:bg-rose-500/10" message="Disconnect this email account?">
            Disconnect email
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
