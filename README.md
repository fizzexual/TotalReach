# TotalReach CRM

A full-stack CRM web application — the working product behind a "Luman"-style marketing site.
Manage contacts, companies, a drag-and-drop deal pipeline, and tasks/activities in one clean,
focused workspace.

> A dark, Attio-style data-table interface built with Next.js (App Router) + TypeScript + Tailwind CSS + Prisma/SQLite.

## Features

- **Authentication** — email/password sign-up & sign-in, hashed passwords (bcrypt), JWT session in an httpOnly cookie, route protection via Next.js proxy (middleware).
- **Dashboard** — KPIs (open pipeline value, open deals, won this month, contacts), a pipeline-by-stage chart, stage breakdown, recent activity, and upcoming tasks.
- **Companies** — a spreadsheet-style data table (domains, associated deals, ICP Fit, estimated ARR, connection strength) with full create / edit / delete and detail pages.
- **People** — searchable contacts table with company links, statuses, and detail pages.
- **Deal pipeline** — a Kanban board with drag-and-drop across stages (Lead → Qualified → Proposal → Negotiation → Won / Lost), per-column value totals, and inline create/edit.
- **Tasks & activities** — calls, emails, meetings, notes and to-dos linked to contacts and deals, with due dates, overdue/today highlighting, and a one-click "done" toggle.
- **Settings** — edit your profile; view account details.
- **Seeded demo data** so the app looks alive on first run.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite via Prisma ORM |
| Auth | Custom — `bcryptjs` + `jose` (JWT) + httpOnly cookie |
| Drag & drop | `@dnd-kit` |
| Charts | `recharts` |
| Icons | `lucide-react` |
| Tests | Vitest |

## Getting started

Prerequisites: **Node.js 18+** and npm.

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env          # then edit AUTH_SECRET (any long random string)

# 3. Create the database and generate the Prisma client
npm run db:push

# 4. Seed realistic demo data (optional but recommended)
npm run db:seed

# 5. Start the dev server
npm run dev
```

Open <http://localhost:3000>.

### Demo account

After seeding:

- **Email:** `demo@totalreach.app`
- **Password:** `password123`

Or create a brand-new account from the sign-up page.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run db:push` | Apply the Prisma schema to the database |
| `npm run db:seed` | Seed demo data (idempotent — resets the demo user) |
| `npm run db:reset` | Wipe the DB, re-apply schema, and re-seed |
| `npm run test` | Run unit tests (Vitest) |
| `npm run lint` | Lint the project |

## Project structure

```
src/
  app/
    (auth)/            # login & register (public)
    (app)/             # authenticated app: dashboard, contacts, companies, deals, tasks, settings
    layout.tsx         # root layout (fonts, metadata)
    page.tsx           # redirects to /dashboard or /login
  components/
    ui.tsx             # design-system primitives (Button, Card, Field, Badge, ...)
    app/app-shell.tsx  # sidebar + topbar + user menu
    forms/             # contact / company / deal / activity form modals
    deals/deal-board.tsx
    activity-list.tsx
  lib/
    auth.ts            # password hashing, sessions, current user
    db.ts              # Prisma client singleton
    actions/           # server actions (auth, contacts, companies, deals, activities, profile)
    constants.ts       # deal stages, activity types, status metadata
    format.ts          # currency / date formatting helpers
    validation.ts      # form parsing & Zod helpers
  proxy.ts             # route protection (Next.js proxy / middleware)
prisma/
  schema.prisma        # data model
  seed.ts              # demo data
```

## Data model

`User` → owns → `Company`, `Contact`, `Deal`, `Activity`.
`Contact` belongs to an optional `Company`; `Deal` links to an optional `Contact` and `Company`;
`Activity` links to an optional `Contact`, `Deal`, or `Company`. Everything is scoped to the
signed-in user.

## Security notes

- Set a strong, unique `AUTH_SECRET` in production.
- `.env` and the SQLite database (`*.db`) are git-ignored and never committed.
- For a production deployment, switch the datasource to a hosted database (e.g. Postgres) by
  updating `prisma/schema.prisma` and `DATABASE_URL`.

## License

Private project.
