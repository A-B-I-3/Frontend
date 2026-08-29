# AI Interview Platform — Unified Project

This merges two things into one project:
- **Frontend**: Copilot's React + Vite + TypeScript build (landing page, welcome page,
  auth screen, dashboards, mocked interview/results pages) — kept as-is for everything
  except the two registration forms
- **Backend**: the Express + PostgreSQL API (verification, gating, matching) built earlier
  in this thread

## What changed in the merge

Copilot's original `CandidateRegistrationPage` and `CompanyRegistrationPage` were **flat,
single-step, mock-only forms** — one page with every field at once, `console.log(values)` on
submit, no email verification, no server call. Those have been replaced with real,
backend-connected, gated wizards:

- `/candidate/register/profile` → `/verify` → `/education` → `/documents` → `/candidate/interviews`
- `/company/register/profile` → `/verify-company` → `/personal` → `/verify-personal` → `/subscription`

Everything else Copilot built — `LandingPage`, `WelcomePage`, `AuthPage`,
`CandidateDashboardPage`, `InterviewPage`, `ResultsPage`, `CompanyDashboardPage`,
`CompanySessionPage` — is untouched. The "Get started" / "For candidates" / "For employers"
links on the landing and welcome pages already point at `/candidate/register` and
`/company/register`, which now redirect straight into the new wizards.

The new wizard components live in `frontend/src/pages/candidate/` and
`frontend/src/pages/company/`, styled with Copilot's existing design tokens (`primary` /
`secondary` / `accent` colors, `.field` / `.btn` / `.btn-primary` classes) so they look native
to the rest of the app, not bolted on.

Localization: all new wizard strings were added under a `wizard.*` namespace in both
`src/locales/en.json` and `src/locales/sw.json`, matching Copilot's existing i18next setup
(Swahili default, `ai-interview-language` localStorage key). Every key referenced by the new
components was cross-checked against both locale files — nothing is left untranslated.

## Setup

### Backend
```bash
cd backend
cp .env.example .env      # fill in DATABASE_URL and JWT_SECRET
npm install
npm run db:init           # applies schema.sql to your Postgres database
npm run dev                # http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

Open `http://localhost:5173` — the landing page loads first (Swahili by default). Click
through to either wizard, or go directly to `/candidate/register` or `/company/register`.

## What's real vs. stubbed (unchanged from the backend build)
- **Email sending** (`backend/src/utils/mailer.js`) logs the code to the console — swap in
  a real provider before production.
- **Sector/profession/skills lists** (`frontend/src/data/wizardData.ts`) are the same
  placeholder data Copilot's original forms used — English-only, not localized yet.
- **Subscription plans** have no real pricing or payment processor wired in.
- **The live AI interview session** (video, questions, scoring) isn't built. The matched
  interview list creates/completes a session record and the continue/stop prompt works, but
  the interview experience itself is Copilot's existing mocked `InterviewPage` /
  `ResultsPage` — not yet connected to the new session records.
- **Postgres field names** (`jina`, `taaluma`, `sekta`, etc.) are still placeholders pending
  your real schema.

## Known scaffold limitation
Onboarding state (pre-verification interviewee/interviewer IDs, the interviewer staging
token) lives in React context, so a hard page refresh mid-wizard loses that pointer — the
already-saved database record is untouched, but the user would need to re-submit that
step's form. Move this to persisted storage before shipping if reload-survival matters.
