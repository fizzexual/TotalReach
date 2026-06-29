import { Field, Input, Select, Textarea } from "@/components/ui";
import { DEAL_STAGES } from "@/lib/constants";
import { toDateInputValue } from "@/lib/format";

export type DealCardData = {
  id: string;
  title: string;
  value: number;
  stage: string;
  status: string;
  closeDate: Date | null;
  notes: string | null;
  contactId: string | null;
  companyId: string | null;
  contactName: string | null;
  companyName: string | null;
  order: number;
};

export type Option = { id: string; name: string };

export function DealFields({
  deal,
  contacts,
  companies,
  fieldErrors,
}: {
  deal?: DealCardData;
  contacts: Option[];
  companies: Option[];
  fieldErrors?: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <Field label="Deal name" htmlFor="title" error={fieldErrors?.title}>
        <Input id="title" name="title" defaultValue={deal?.title ?? ""} placeholder="e.g. Acme — Annual plan" required />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Value (USD)" htmlFor="value" error={fieldErrors?.value}>
          <Input id="value" name="value" type="number" min="0" step="100" defaultValue={deal ? String(deal.value) : ""} placeholder="0" />
        </Field>
        <Field label="Stage" htmlFor="stage">
          <Select id="stage" name="stage" defaultValue={deal?.stage ?? "Lead"}>
            {DEAL_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Contact" htmlFor="contactId">
          <Select id="contactId" name="contactId" defaultValue={deal?.contactId ?? ""}>
            <option value="">— None —</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Company" htmlFor="companyId">
          <Select id="companyId" name="companyId" defaultValue={deal?.companyId ?? ""}>
            <option value="">— None —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Expected close date" htmlFor="closeDate">
        <Input id="closeDate" name="closeDate" type="date" defaultValue={toDateInputValue(deal?.closeDate ?? null)} />
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={deal?.notes ?? ""} />
      </Field>
    </div>
  );
}
