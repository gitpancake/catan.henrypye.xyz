# Catan Leaderboard

Settlers of Catan game tracker and leaderboard application.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (new-york style, zinc base) + HextaUI (Avatar, Field)
- **Database**: Supabase Postgres (shared instance, all tables prefixed `catan_`)
- **Auth**: Firebase Auth (shared project `henry-auth-bcd1d`, same as finance app)
- **Storage**: Supabase Storage (`catan-avatars` bucket for profile pictures)
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

Tables: `catan_leagues`, `catan_players`, `catan_games`, `catan_scores`, `catan_league_members`
View: `catan_leaderboard` (aggregates scores per player per league)

Schema: `supabase/migrations/001_initial_schema.sql`, `002_profiles_and_permissions.sql`, `004_enable_rls.sql`

RLS is enabled on all tables with explicit deny-anon policies. The app uses the Supabase **service role key** for all server-side queries (bypasses RLS). RLS serves as defense-in-depth only — application-level permission checks in server actions are the primary access control. The `catan_leaderboard` view inherits RLS from its underlying tables.

### Auth Flow

Firebase Auth is the sole source of user identity (no `catan_users` table). Flow:
1. Firebase Auth on client → `firebase-token` cookie via `/api/auth` route
2. Server-side verification with `firebase-admin` → `adminAuth.verifyIdToken()` + `adminAuth.getUser()`
3. Session returns `{ uid, email, displayName, photoURL }` directly from Firebase

Key files:
- `src/lib/firebase.ts` — client Firebase init
- `src/lib/firebase-admin.ts` — server admin SDK (lazy-init proxy)
- `src/lib/auth.ts` — session management (Firebase-only, no DB lookup)
- `src/lib/firebase-users.ts` — batch UID resolution via `adminAuth.getUsers()`
- `src/contexts/AuthContext.tsx` — auth context with `refreshUser()` method
- `src/components/auth-gate.tsx` — login gate

### League Permissions

League membership is managed via `catan_league_members` table with three roles:
- **owner** — full control, can invite/remove members, change roles, enter results
- **co-owner** — can invite participants, enter results
- **participant** — read-only access

Users only see leagues they are members of. Anyone can create a league (becomes owner).

### Profile Management

Users manage their profile via a dialog in the sidebar:
- Display name, email, password changes — all Firebase client-side operations
- Avatar upload — server action uploads to Supabase Storage, updates Firebase `photoURL`

### Data Access

- **Reads**: Direct Supabase queries in Server Components (`src/lib/queries/`)
- **Writes**: Next.js Server Actions with Zod validation (`src/lib/actions/`)
- All data-fetching pages use `export const dynamic = "force-dynamic"`
- Server components call `getSession()` to get the current user's `uid` for filtering

### Pages

- `/dashboard` — Leaderboard with league selector, summary cards, rankings table
- `/games` — Game history list, filterable by league
- `/games/[id]` — Single game detail with all player scores
- `/enter-results` — Full-page form (owner/co-owner only leagues shown)
- `/leagues` — League list with role badges, create dialog
- `/leagues/[id]` — League detail with member management, invite dialog
- `/players` — Player list with add dialog

### UI Patterns

Follows `finance.henrypye.xyz` design system:
- Sidebar Shell layout with dark sidebar, avatar + profile dialog trigger
- Summary cards: `text-xs uppercase tracking-wide` labels, `font-mono text-lg font-semibold` values
- Table headers: `text-xs uppercase tracking-wide text-muted-foreground`
- Numbers: `font-mono` (Geist Mono)
- Catan theme colors: `--catan-gold` (amber), `--catan-ocean` (blue) defined in `globals.css`
- HextaUI Avatar for profile pictures, Field for form layouts

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — shared Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (unused by server, kept for reference)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only, bypasses RLS)
- `NEXT_PUBLIC_FIREBASE_API_KEY` — Firebase client API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — Firebase project ID
- `FIREBASE_SERVICE_ACCOUNT_KEY` — Firebase admin service account JSON
