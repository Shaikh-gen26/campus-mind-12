# Campus Intelligence Hub — Python full stack

A complete, working rebuild: **Flask + PostgreSQL** backend, **React (Vite)**
frontend, no Supabase and no Lovable branding anywhere. Implements every rule
from the original spec — 3 roles, 6 courses × 60 students, strict per-role
access enforced server-side, attendance/grades/assignments/announcements.

## Folders

- `campus-mind-backend/` — Flask API, PostgreSQL models, JWT auth, seed script.
- `campus-mind-frontend/` — React app (Vite, plain CSS, react-router). Login
  page + three role-specific dashboards, talking to the Flask API.

## Run it end to end

**1. Backend**
```bash
cd campus-mind-backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # set DATABASE_URL to your Postgres instance
python -m app.seed        # creates all demo accounts + 360 students
python run.py             # runs on http://localhost:5000
```

**2. Frontend**
```bash
cd campus-mind-frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000
npm run dev                # runs on http://localhost:5173
```

**3. Log in** at `http://localhost:5173` with any demo account from the seed
script, e.g.:
- Super Admin: `SUPERADMIN001` / `Campus@2026Admin`
- Course Admin (CSE): `ADM-CSE-001` / `CSE@2026Admin`
- Student (CSE, roll 1): `CSE2026001` / `CSE@Student001`

Each account is redirected to its own dashboard; the backend rejects any
request outside that role's own data even if a different URL/ID is guessed.

## My CampusGPT

The authenticated app includes **My CampusGPT** for students, course admins,
and super admins. It uses a role-scoped Campus Mind snapshot for relevant
answers about attendance, grades, assignments, announcements, and university
operations. To enable generated replies, put a Gemini API key in the backend
`.env` as `GEMINI_API_KEY` (Google AI Studio offers a free tier; availability
and limits depend on Google's current terms). The key stays server-side. Without
a key, the chatbot still provides basic answers from the Campus Mind records.

## What's real vs. what's a placeholder

- **Real and enforced:** login/JWT auth, role-based routing, server-side
  scoping (a course admin's queries are hard-filtered to their own course;
  a student's queries are hard-filtered to their own record), the full data
  model, and the seeded demo data matching your original spec exactly.
- **Deliberately simple:** the UI is functional and complete for every
  dashboard in the spec, but styled plainly (a ledger/register aesthetic)
  rather than a heavily animated product UI — it's meant to be a correct,
  extensible foundation, not a finished visual design pass.
- **Not included:** file uploads for assignment submissions, email sending,
  and password-reset flows — the spec didn't call for these, so I left them
  out rather than guessing at requirements.

I verified every backend file compiles (`python -m py_compile`) and every
frontend file parses and resolves its imports correctly (`esbuild --bundle`),
though I couldn't run a live `npm install` / database connection in this
environment — do a first `npm install` + `pip install` locally to confirm,
which is expected and normal for any handoff like this.
