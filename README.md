# ICAP — Iraq Conflict Analysis Platform
### منصة تحليل النزاعات العراقية

An AI-powered conflict-analysis platform for researchers, civil-society organizations,
universities, government institutions, and peacebuilding programs working on Iraq.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui primitives · Zustand ·
React Hook Form + Zod · Chart.js · React Flow · Mermaid.js · Leaflet · jsPDF · docx ·
IndexedDB (via `idb`) · Groq API (free tier, no credit card required). No paid backend, no external database —
everything runs client-side plus a single serverless API route for AI calls.

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your GROQ_API_KEY (free at console.groq.com/keys)
npm run dev
```

Open http://localhost:3000.

## Project status

This is being built module by module. Completed so far:

- [x] Project scaffold — configs, design tokens, RTL/Arabic-first theming, dark mode
- [x] Core domain types (`types/conflict.ts`)
- [x] IndexedDB data layer (`lib/db.ts`)
- [x] Secure server-only Gemini client + `/api/analyze` route
- [x] Home page (bilingual hero, live stats, module grid)
- [x] Dashboard shell (KPIs, recent conflicts table)
- [x] Navbar with language/theme toggles
- [x] Google Sign-In (NextAuth, JWT sessions — no database; every page requires login)
- [x] Shared database (Neon Postgres via Prisma) — every signed-in teammate reads/writes the same conflicts

Still to come (in order): New Conflict form → Stakeholders module + network graph →
Timeline → Root Causes/Effects → Problem Tree (React Flow) → Onion Model → ABC Triangle
→ Stakeholder map → Iraq map (Leaflet) → AI Analysis trigger + results view → Risk
scoring UI → Scenarios → Reports (PDF/DOCX export) → Search → Statistics → Knowledge
Base → Settings → PWA/offline support.

## Environment variables

| Variable | Where used | Notes |
|---|---|---|
| `DATABASE_URL` | `lib/prisma.ts` | Free Postgres connection string from Neon (console.neon.tech). Shared by every user — this is what makes the app collaborative. |
| `GROQ_API_KEY` | `lib/ai.ts` (server only) | Never exposed to the client. Free, no credit card required — get one at console.groq.com/keys. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | `lib/auth.ts` | Free OAuth credentials from Google Cloud Console → APIs & Services → Credentials. |
| `NEXTAUTH_SECRET` | NextAuth session encryption | Any long random string. |
| `NEXTAUTH_URL` | NextAuth | The app's URL — `http://localhost:3000` locally, your live domain in production. |

Set all of these in `.env.local` locally and in Netlify's environment variable settings in production.

After setting `DATABASE_URL`, create the database table once with:

```bash
npm run db:push
```

## Deployment (Netlify, free tier)

1. Push this repo to GitHub.
2. In Netlify: **New site from Git** → select the repo.
3. Add the `@netlify/plugin-nextjs` plugin (already declared in `netlify.toml`).
4. Set `GEMINI_API_KEY` under Site settings → Environment variables.
5. Deploy.

## License

MIT — see `LICENSE`.
