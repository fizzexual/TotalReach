"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Field, Input } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { updateProfile } from "@/lib/actions/profile";
import type { FormState } from "@/lib/validation";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action] = useActionState<FormState, FormData>(updateProfile, {});
  const router = useRouter();

  React.useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      {state.ok && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Profile updated.
        </div>
      )}
      <Field label="Name" htmlFor="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" defaultValue={name} required />
      </Field>
      <Field label="Email" htmlFor="email" hint="Email cannot be changed in this demo.">
        <Input id="email" defaultValue={email} disabled />
      </Field>
      <SubmitButton>Save changes</SubmitButton>
    </form>
  );
}
