export const APP_NAME = "TotalReach";

export const DEAL_STAGES = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const CLOSED_STAGES: DealStage[] = ["Won", "Lost"];

export const STAGE_META: Record<
  DealStage,
  { label: string; badge: string; dot: string; bar: string }
> = {
  Lead: { label: "Lead", badge: "bg-zinc-500/15 text-zinc-300", dot: "bg-zinc-400", bar: "bg-zinc-500" },
  Qualified: { label: "Qualified", badge: "bg-sky-500/15 text-sky-300", dot: "bg-sky-500", bar: "bg-sky-500" },
  Proposal: { label: "Proposal", badge: "bg-violet-500/15 text-violet-300", dot: "bg-violet-500", bar: "bg-violet-500" },
  Negotiation: { label: "Negotiation", badge: "bg-amber-500/15 text-amber-300", dot: "bg-amber-500", bar: "bg-amber-500" },
  Won: { label: "Won", badge: "bg-emerald-500/15 text-emerald-300", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  Lost: { label: "Lost", badge: "bg-rose-500/15 text-rose-300", dot: "bg-rose-500", bar: "bg-rose-500" },
};

export const ACTIVITY_TYPES = ["Task", "Call", "Email", "Meeting", "Note"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_META: Record<ActivityType, { label: string; badge: string }> = {
  Task: { label: "Task", badge: "bg-indigo-500/15 text-indigo-300" },
  Call: { label: "Call", badge: "bg-sky-500/15 text-sky-300" },
  Email: { label: "Email", badge: "bg-violet-500/15 text-violet-300" },
  Meeting: { label: "Meeting", badge: "bg-amber-500/15 text-amber-300" },
  Note: { label: "Note", badge: "bg-zinc-500/15 text-zinc-300" },
};

export const CONTACT_STATUSES = ["Lead", "Active", "Inactive"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_STATUS_BADGE: Record<ContactStatus, string> = {
  Lead: "bg-amber-500/15 text-amber-300",
  Active: "bg-emerald-500/15 text-emerald-300",
  Inactive: "bg-zinc-500/15 text-zinc-400",
};

// --- Company enrichment fields (shown on the Companies table) ---

export const ICP_FITS = ["Excellent", "Good", "Medium", "Low"] as const;
export type IcpFit = (typeof ICP_FITS)[number];

export const ICP_FIT_BADGE: Record<string, string> = {
  Excellent: "bg-violet-500/15 text-violet-300",
  Good: "bg-emerald-500/15 text-emerald-300",
  Medium: "bg-sky-500/15 text-sky-300",
  Low: "bg-zinc-500/15 text-zinc-400",
};

export const CONNECTION_STRENGTHS = ["Very strong", "Strong", "Medium", "Low"] as const;
export type ConnectionStrength = (typeof CONNECTION_STRENGTHS)[number];

export const CONNECTION_META: Record<string, { label: string; color: string }> = {
  "Very strong": { label: "Very strong", color: "text-emerald-400" },
  Strong: { label: "Strong", color: "text-green-400" },
  Medium: { label: "Medium", color: "text-sky-400" },
  Low: { label: "Low", color: "text-amber-400" },
};

/** Deterministic accent color for a company "logo" tile, derived from its name. */
export const LOGO_TINTS = [
  "bg-emerald-500/20 text-emerald-300",
  "bg-sky-500/20 text-sky-300",
  "bg-violet-500/20 text-violet-300",
  "bg-amber-500/20 text-amber-300",
  "bg-rose-500/20 text-rose-300",
  "bg-indigo-500/20 text-indigo-300",
  "bg-teal-500/20 text-teal-300",
  "bg-fuchsia-500/20 text-fuchsia-300",
];

export function tintFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return LOGO_TINTS[h % LOGO_TINTS.length];
}
