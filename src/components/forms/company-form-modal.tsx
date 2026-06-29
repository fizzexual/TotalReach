"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field, FormError, Input, Select, Textarea, type ButtonVariant } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { ICP_FITS, CONNECTION_STRENGTHS } from "@/lib/constants";
import type { FormState } from "@/lib/validation";
import { createCompany, updateCompany } from "@/lib/actions/companies";

export type CompanyValues = {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  domain: string | null;
  phone: string | null;
  location: string | null;
  notes: string | null;
  icpFit: string | null;
  estimatedArr: string | null;
  connectionStrength: string | null;
};

export function CompanyFormModal({
  company,
  trigger,
  triggerLabel = "Add company",
  triggerVariant = "primary",
}: {
  company?: CompanyValues;
  trigger?: React.ReactNode;
  triggerLabel?: string;
  triggerVariant?: ButtonVariant;
}) {
  const isEdit = Boolean(company?.id);
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState<FormState, FormData>(
    isEdit ? updateCompany : createCompany,
    {},
  );
  const router = useRouter();

  React.useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="inline-flex">
          {trigger}
        </span>
      ) : (
        <Button variant={triggerVariant} onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> {triggerLabel}
        </Button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={isEdit ? "Edit company" : "New company"}>
        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={company!.id} />}
          {state.error && <FormError>{state.error}</FormError>}
          <Field label="Company name" htmlFor="name" error={state.fieldErrors?.name}>
            <Input id="name" name="name" defaultValue={company?.name ?? ""} placeholder="Acme Inc." required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Domain" htmlFor="domain">
              <Input id="domain" name="domain" defaultValue={company?.domain ?? ""} placeholder="acme.com" />
            </Field>
            <Field label="Industry" htmlFor="industry">
              <Input id="industry" name="industry" defaultValue={company?.industry ?? ""} placeholder="SaaS" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Website" htmlFor="website">
              <Input id="website" name="website" defaultValue={company?.website ?? ""} placeholder="https://acme.com" />
            </Field>
            <Field label="Location" htmlFor="location">
              <Input id="location" name="location" defaultValue={company?.location ?? ""} placeholder="San Francisco, CA" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ICP Fit" htmlFor="icpFit">
              <Select id="icpFit" name="icpFit" defaultValue={company?.icpFit ?? ""}>
                <option value="">— None —</option>
                {ICP_FITS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Connection strength" htmlFor="connectionStrength">
              <Select id="connectionStrength" name="connectionStrength" defaultValue={company?.connectionStrength ?? ""}>
                <option value="">— None —</option>
                {CONNECTION_STRENGTHS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Estimated ARR" htmlFor="estimatedArr">
              <Input id="estimatedArr" name="estimatedArr" defaultValue={company?.estimatedArr ?? ""} placeholder="$500M–$650M" />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" name="phone" defaultValue={company?.phone ?? ""} placeholder="+1 555 000 0000" />
            </Field>
          </div>
          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" name="notes" defaultValue={company?.notes ?? ""} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton>{isEdit ? "Save changes" : "Create company"}</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
