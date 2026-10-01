# Campus Intelligence Hub — Python (Flask) Backend

This replaces Supabase entirely with a self-contained Flask + PostgreSQL API,
implementing every rule from the original product spec: 3 roles (Super Admin,
Course Admin, Student), 6 engineering courses × 60 students, strict per-role
data access, attendance/assignments/grades/announcements/events.

## 1. Install & configure

```bash
cd campus-mind-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env:
#   DATABASE_URL — point at a Postgres database (a fresh local Postgres,
#     or your EXISTING Supabase Postgres connection string works fine —
#     Project Settings > Database > Connection string > URI. Either way,
#     this app talks to Postgres directly and no longer uses Supabase's
#     client SDK or Auth service.)
#   JWT_SECRET_KEY — generate with: python -c "import secrets; print(secrets.token_hex(32))"
#   CORS_ORIGINS — your frontend's dev/prod URL(s)
```

## 2. Create tables & seed demo data

```bash
python -m app.seed
```

This wipes and recreates all tables, then creates:
- 1 Super Admin — `SUPERADMIN001` / `Campus@2026Admin`
- 6 Course Admins — e.g. `ADM-CSE-001` / `CSE@2026Admin` (see `app/seed.py` for all 6)
- 360 students across 6 courses — e.g. `CSE2026001` / `CSE@Student001`
- Subjects, attendance history, grades, assignments/submissions, announcements, events

## 3. Run the API

```bash
python run.py
```

Runs on `http://localhost:5000`. Health check: `GET /api/health`.

## 4. Wire up the existing frontend

Your React/TanStack/Tailwind frontend stays as-is structurally — only its data
layer changes:

1. Copy `frontend-integration/api.ts` into the frontend as `src/lib/api.ts`.
2. Find and remove the Supabase client setup (typically `src/integrations/supabase/client.ts`
   or `src/lib/supabase.ts`) and the `@supabase/supabase-js` dependency from `package.json`.
3. Replace every `supabase.auth.signInWithPassword(...)` call with `api.login(loginId, password)`,
   and store the returned `token` with `setToken()` from `api.ts`.
4. Replace `supabase.from('...').select()` / RLS-gated queries with the matching
   `api.superAdmin.*` / `api.courseAdmin.*` / `api.student.*` calls — the route
   names mirror the dashboards described in the product spec (Super Admin,
   Course Admin, Student).
5. Add `VITE_API_URL=http://localhost:5000` to the frontend's `.env`.
6. Remove `VITE_SUPABASE_*` / `SUPABASE_*` variables once nothing references them.

I don't have visibility into your actual `src/` component files (they uploaded
empty), so step 3-4 will need you (or me, once you upload real `src/` contents)
to go file-by-file replacing the specific Supabase calls with these `api.*` calls.

## 5. Access control model

Role checks happen **server-side** via JWT claims (`app/auth.py`'s
`roles_required` decorator) on every route — not just hidden in the UI. This
mirrors the spec's requirement that e.g. a Course Admin can never fetch another
course's students even by guessing a URL/ID, and a Student can never fetch the
full 360-student dataset.

## Project structure

```
campus-mind-backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── extensions.py        # db, jwt instances
│   ├── models.py            # All SQLAlchemy models
│   ├── auth.py               # Login route + role-based access decorator
│   ├── routes_superadmin.py # Super Admin API
│   ├── routes_courseadmin.py# Course Admin API (scoped to own course)
│   ├── routes_student.py    # Student API (scoped to own record)
│   └── seed.py               # Demo data generator
├── frontend-integration/
│   └── api.ts                # Drop-in fetch client for the React frontend
├── config.py
├── run.py
├── requirements.txt
└── .env.example
```
