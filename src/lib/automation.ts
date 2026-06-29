import type { ComponentType } from "react";
import { Mail, UserPlus, CircleDollarSign, Trophy, Send, ClipboardList, CheckSquare, PencilLine, Bell } from "lucide-react";

type Icon = ComponentType<{ className?: string }>;

export const TRIGGERS: Record<string, { label: string; badge: string; icon: Icon; desc: string }> = {
  email_opened: { label: "When email opened", badge: "Email", icon: Mail, desc: "Trigger when a marketing email is opened" },
  email_clicked: { label: "When email link clicked", badge: "Email", icon: Mail, desc: "Trigger when a link in an email is clicked" },
  contact_created: { label: "When person created", badge: "Person", icon: UserPlus, desc: "Trigger when a new person is added" },
  deal_created: { label: "When deal created", badge: "Deal", icon: CircleDollarSign, desc: "Trigger when a new deal is created" },
  deal_won: { label: "When deal won", badge: "Deal", icon: Trophy, desc: "Trigger when a deal is marked won" },
};

export const ACTIONS: Record<string, { label: string; icon: Icon; defaultSubtitle: string }> = {
  send_email: { label: "Send email", icon: Send, defaultSubtitle: 'Send "Follow-up offer email"' },
  add_to_list: { label: "Add to list", icon: ClipboardList, defaultSubtitle: 'Add contact to "Engaged"' },
  create_task: { label: "Create task", icon: CheckSquare, defaultSubtitle: "Create a follow-up task" },
  update_field: { label: "Update field", icon: PencilLine, defaultSubtitle: "Update a record field" },
  notify_team: { label: "Notify team", icon: Bell, defaultSubtitle: "Send a team notification" },
};

export const TRIGGER_OPTIONS = Object.keys(TRIGGERS).map((value) => ({ value, label: TRIGGERS[value].label }));
export const ACTION_OPTIONS = Object.keys(ACTIONS).map((value) => ({ value, label: ACTIONS[value].label }));

export const CONDITION_FIELDS = ["Email opened", "Deal value", "Deal stage", "Person status", "Company ICP fit"] as const;
export const CONDITION_OPERATORS = ["is", "is not", "greater than", "less than", "contains"] as const;

export function getTrigger(type: string) {
  return TRIGGERS[type] ?? TRIGGERS.email_opened;
}

export function getAction(type: string) {
  return ACTIONS[type] ?? ACTIONS.send_email;
}
