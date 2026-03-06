# Catan Leaderboard

Settlers of Catan game tracker and leaderboard application.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (new-york style, zinc base)
- **Database**: Supabase Postgres (shared instance, all tables prefixed `catan_`)
- **Auth**: Firebase Auth (shared project `henry-auth-bcd1d`, same as finance app)
- **Icons**: Lucide React
- **Fonts**: Geist (sans + mono)

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
```

## Architecture

### Database (Supabase - shared instance)

Tables: `catan_users`, `catan_leagues`, `catan_players`, `catan_games`, `catan_scores`
View: `catan_leaderboard` (aggregates scores per player per league)

Schema lives in `supabase/migrations/001_initial_schema.sql`.

### Auth Flow

Firebase Auth on client → `firebase-token` cookie via `/api/auth` route → server-side verification with `firebase-admin` → user lookup in `catan_users` table.

Files copied/adapted from `finance.henrypye.xyz`:
- `src/lib/firebase.ts` — client Firebase init
- `src/lib/firebase-admin.ts` — server admin SDK
- `src/lib/auth.ts` — session management (uses `catan_users` table)
- `src/contexts/AuthContext.tsx` — auth context
- `src/components/auth-gate.tsx` — login gate

### Data Access

- **Reads**: Direct Supabase queries in Server Components (`src/lib/queries/`)
- **Writes**: Next.js Server Actions with Zod validation (`src/lib/actions/`)
- All pages use `export const dynamic = "force-dynamic"` since they fetch from Supabase

### Pages

- `/dashboard` — Leaderboard with league selector, summary cards, rankings table
- `/games` — Game history list, filterable by league
- `/games/[id]` — Single game detail with all player scores
- `/enter-results` — Full-page form for entering game results
- `/leagues` — League management with create dialog
- `/players` — Player list with add dialog

### UI Patterns

Follows `finance.henrypye.xyz` design system:
- Sidebar Shell layout with dark sidebar
- Summary cards: `text-xs uppercase tracking-wide` labels, `font-mono text-lg font-semibold` values
- Table headers: `text-xs uppercase tracking-wide text-muted-foreground`
- Numbers: `font-mono` (Geist Mono)
- Catan theme colors: `--catan-gold` (amber), `--catan-ocean` (blue) defined in `globals.css`

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — shared Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `NEXT_PUBLIC_FIREBASE_API_KEY` — Firebase client API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — Firebase project ID
- `FIREBASE_SERVICE_ACCOUNT_KEY` — Firebase admin service account JSON
