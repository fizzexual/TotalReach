"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { simulateRun, resetRun } from "@/lib/actions/automations";

export function RunControls({ automationId, hasRun }: { automationId: string; hasRun: boolean }) {
  const router = useRouter();
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
      <Button variant="secondary" disabled={busy} onClick={() => go(() => simulateRun(automationId))}>
        <Play className="h-4 w-4" /> Simulate run
      </Button>
    </div>
  );
}
