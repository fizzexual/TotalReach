"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Mail,
  CheckSquare,
  StickyNote,
  BarChart3,
  Workflow,
  Building2,
  Users,
  CircleDollarSign,
  LayoutGrid,
  ChevronDown,
  ChevronsUpDown,
  PanelLeft,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/auth";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number };

const TOP: NavItem[] = [
  { href: "/notifications", label: "Notifications", icon: Bell, badge: 8 },
  { href: "/emails", label: "Emails", icon: Mail },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/dashboard", label: "Reports", icon: BarChart3 },
  { href: "/automation", label: "Automation", icon: Workflow },
];

const RECORDS: NavItem[] = [
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/contacts", label: "People", icon: Users },
  { href: "/deals", label: "Deals", icon: CircleDollarSign },
  { href: "/workspaces", label: "Workspaces", icon: LayoutGrid },
];

const LISTS: NavItem[] = [
  { href: "/contacts", label: "People", icon: Users },
  { href: "/deals", label: "Deals", icon: CircleDollarSign },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active ? "bg-white/[0.06] text-zinc-100" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
      )}
    >
      <Icon className={cn("h-[17px] w-[17px]", active ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300")} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-zinc-300">{item.badge}</span>
      ) : null}
    </Link>
  );
}

function GroupHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 px-2.5 pb-1 pt-4 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
      <ChevronDown className="h-3 w-3" />
      {label}
    </div>
  );
}

function SidebarBody({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {/* Search */}
      <button
        type="button"
        className="mx-3 mt-3 flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-sm text-zinc-500 transition hover:bg-white/[0.05]"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search anything</span>
        <kbd className="rounded border border-white/10 bg-white/5 px-1.5 text-[11px] text-zinc-400">⌘K</kbd>
      </button>

      <nav className="mt-3 space-y-0.5 px-2">
        {TOP.map((item) => (
          <NavLink key={item.label} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}

        <GroupHeader label="Records" />
        {RECORDS.map((item) => (
          <NavLink key={`r-${item.label}`} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}

        <GroupHeader label="List" />
        {LISTS.map((item) => (
          <NavLink key={`l-${item.label}`} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </nav>
    </>
  );
}

function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-[calc(100%-0px)] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
          <div className="border-b border-white/[0.07] px-3 py-2.5">
            <p className="truncate text-sm font-medium text-zinc-200">{user.name}</p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
          <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5">
            <Settings className="h-4 w-4 text-zinc-500" /> Settings
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-400 transition hover:bg-rose-500/10">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition hover:bg-white/[0.04]"
      >
        <Avatar name={user.name} className="h-7 w-7 bg-emerald-500/20 text-emerald-300" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-zinc-200">{user.name}</span>
          <span className="block truncate text-xs text-zinc-500">{user.email}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-zinc-500" />
      </button>
    </div>
  );
}

function TeamPresence({ user }: { user: SessionUser }) {
  const teammates = [
    { name: user.name, tint: "bg-emerald-500/30 text-emerald-200" },
    { name: "Avery Kim", tint: "bg-sky-500/30 text-sky-200" },
    { name: "Jordan Diaz", tint: "bg-violet-500/30 text-violet-200" },
  ];
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {teammates.map((t, i) => (
          <Avatar key={i} name={t.name} className={cn("h-7 w-7 ring-2 ring-zinc-950", t.tint)} />
        ))}
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[11px] font-medium text-zinc-300 ring-2 ring-zinc-950">
          +2
        </span>
      </div>
      <button type="button" className="ml-1 rounded-lg border border-white/10 p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200">
        <MessageSquare className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/[0.06] bg-zinc-950 lg:flex">
        <div className="flex h-14 items-center justify-between px-3">
          <Link href="/companies" className="flex items-center gap-1.5 rounded-md px-1 py-1 hover:bg-white/5">
            <Brand />
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </Link>
          <button type="button" className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300">
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pb-3">
          <SidebarBody pathname={pathname} />
        </div>
        <div className="border-t border-white/[0.06] p-2">
          <UserMenu user={user} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-white/[0.06] bg-zinc-950">
            <div className="flex h-14 items-center justify-between px-3">
              <Brand />
              <button type="button" onClick={() => setMobileOpen(false)} className="rounded-md p-1.5 text-zinc-400 hover:bg-white/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pb-3">
              <SidebarBody pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-white/[0.06] p-2">
              <UserMenu user={user} />
            </div>
          </aside>
        </div>
      )}

      {/* Topbar */}
      <header className="fixed inset-x-0 top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-white/[0.06] bg-zinc-950/80 px-4 backdrop-blur lg:left-60 lg:px-6">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-zinc-400 hover:bg-white/5 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex-1" />
        <TeamPresence user={user} />
      </header>

      {/* Main */}
      <main className="pt-14 lg:pl-60">
        <div className="px-4 py-5 sm:px-6">{children}</div>
      </main>
    </div>
  );
}
