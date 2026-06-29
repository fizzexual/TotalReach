"use client";

import { useActionState } from "react";
import { registerAction } from "@/lib/actions/auth";
import { Field, FormError, Input } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/lib/validation";

export function RegisterForm() {
  const [state, action] = useActionState<FormState, FormData>(registerAction, {});

  return (
    <form action={action} className="space-y-4">
      {state.error && <FormError>{state.error}</FormError>}
      <Field label="Full name" htmlFor="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" autoComplete="name" placeholder="Jane Doe" required />
      </Field>
      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
      </Field>
      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password} hint="At least 6 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="••••••••" required />
      </Field>
      <SubmitButton size="lg" className="w-full">
        Create account
      </SubmitButton>
    </form>
  );
}
