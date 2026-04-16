# catan.henrypye.xyz

A **Settlers of Catan leaderboard** web app — track games, players, leagues, and head-to-head stats across your recurring Catan sessions.

## Features

- **Leagues** — create private leagues, invite members, leave leagues
- **Players** — add players to a league, update profiles
- **Games** — enter results (winner, second place, victory-point breakdowns) via `/enter-results`
- **Leaderboard** — per-league rankings with summary cards + sortable leaderboard table
- **Auth** — Firebase Auth gate (`auth-gate.tsx`) protects authenticated routes

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **shadcn/ui 4** + Tailwind CSS for the component library
- **Firebase Auth** (client + admin) for authentication
- **Supabase** (`@supabase/supabase-js`) as the backing database
- **next-themes** for light/dark mode

## Routes

| Path | Purpose |
|---|---|
| `/` | Redirects → `/dashboard` |
| `/dashboard` | Signed-in landing with summary cards + league selector |
| `/leagues` | League management (create, invite, leave) |
| `/players` | Player roster per league |
| `/games` | Game history |
| `/enter-results` | Game-result submission form |
| `/api/auth`, `/api/leagues`, `/api/players`, `/api/games` | Backing API routes |

## Structure

```
src/
├── app/
│   ├── (app)/                # Authenticated app shell — dashboard, games, leagues, players, enter-results
│   ├── api/                  # auth, games, leagues, players
│   ├── page.tsx              # Redirect → /dashboard
│   ├── layout.tsx
│   └── opengraph-image.tsx   # Dynamic OG image
├── components/
│   ├── auth-gate.tsx
│   ├── create-league-dialog.tsx, create-player-dialog.tsx
│   ├── game-results-form.tsx
│   ├── invite-member-dialog.tsx, leave-league-button.tsx
│   ├── leaderboard-table.tsx, summary-cards.tsx
│   ├── league-members-table.tsx, league-selector.tsx
│   ├── profile-dialog.tsx, refresh-button.tsx
│   └── ui/                   # shadcn primitives
└── lib/
    ├── firebase.ts, firebase-admin.ts, firebase-users.ts
    ├── supabase.ts, auth.ts
    ├── queries/              # leagues, players, games, members, leaderboard
    └── actions/              # Server actions: leagues, players, games, profile
```

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Firebase + Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Requires:
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config
- `FIREBASE_ADMIN_*` — Firebase Admin SDK service-account credentials
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase
