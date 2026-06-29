"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Play, RotateCcw, Send } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field, Input } from "@/components/ui";
import { runNow, resetRun } from "@/lib/actions/automations";

export function RunControls({
  automationId,
  hasRun,
  defaultEmail,
}: {
  automationId: string;
  hasRun: boolean;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState(defaultEmail);
  const [busy, setBusy] = React.useState(false);

  async function go(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {hasRun && (
        <Button variant="ghost" disabled={busy} onClick={() => go(() => resetRun(automationId))}>
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      )}
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Play className="h-4 w-4" /> Run now
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Run automation now">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            This executes every step for real. Any <span className="text-zinc-200">Send email</span> steps will email
            the recipient below (use your own address to test).
          </p>
          <Field label="Send email(s) to" htmlFor="runEmail">
            <Input id="runEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              disabled={busy}
              onClick={() =>
                go(async () => {
                  await runNow(automationId, email);
                  setOpen(false);
                })
              }
            >
              <Send className="h-4 w-4" /> Run &amp; send
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
