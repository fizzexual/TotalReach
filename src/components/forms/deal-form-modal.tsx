"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { DealFields, type Option } from "@/components/forms/deal-fields";
import type { FormState } from "@/lib/validation";
import { createDeal } from "@/lib/actions/deals";

export function DealFormModal({ contacts, companies }: { contacts: Option[]; companies: Option[] }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState<FormState, FormData>(createDeal, {});
  const router = useRouter();

  React.useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> New deal
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="New deal">
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </div>
          )}
          <DealFields contacts={contacts} companies={companies} fieldErrors={state.fieldErrors} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton>Create deal</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
