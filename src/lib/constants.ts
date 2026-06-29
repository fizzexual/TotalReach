export const DEAL_STAGES = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

/** Stages shown as won/lost (closed) — everything else is "Open". */
export const CLOSED_STAGES: DealStage[] = ["Won", "Lost"];

export const STAGE_META: Record<
  DealStage,
  { label: string; badge: string; dot: string; bar: string }
> = {
  Lead: { label: "Lead", badge: "bg-slate-100 text-slate-700", dot: "bg-slate-400", bar: "bg-slate-400" },
  Qualified: { label: "Qualified", badge: "bg-sky-100 text-sky-700", dot: "bg-sky-500", bar: "bg-sky-500" },
  Proposal: { label: "Proposal", badge: "bg-violet-100 text-violet-700", dot: "bg-violet-500", bar: "bg-violet-500" },
  Negotiation: { label: "Negotiation", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", bar: "bg-amber-500" },
  Won: { label: "Won", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  Lost: { label: "Lost", badge: "bg-rose-100 text-rose-700", dot: "bg-rose-500", bar: "bg-rose-500" },
};

export const ACTIVITY_TYPES = ["Task", "Call", "Email", "Meeting", "Note"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_META: Record<ActivityType, { label: string; badge: string }> = {
  Task: { label: "Task", badge: "bg-indigo-100 text-indigo-700" },
  Call: { label: "Call", badge: "bg-sky-100 text-sky-700" },
  Email: { label: "Email", badge: "bg-violet-100 text-violet-700" },
  Meeting: { label: "Meeting", badge: "bg-amber-100 text-amber-700" },
  Note: { label: "Note", badge: "bg-slate-100 text-slate-700" },
};

export const CONTACT_STATUSES = ["Lead", "Active", "Inactive"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_STATUS_BADGE: Record<ContactStatus, string> = {
  Lead: "bg-amber-100 text-amber-700",
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-600",
};
