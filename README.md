# CrediGuide

Your credit health companion — monitor your credit score and credit-health
factors, track loans, EMIs and bill payments, receive due-date reminders,
and follow a personalised credit improvement plan.

Built by **SIE Team 2, CMR College of Engineering & Technology** as a
Social Innovation and Entrepreneurship (SIE) project.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, Tailwind CSS 4, React Router, Recharts, Lucide icons |
| Backend / Database | Supabase (PostgreSQL, Auth, Row Level Security) |
| Hosting | Vercel |

Authentication is email + password via Supabase Auth. Every database table
is protected by Row Level Security, so each user can only access their own
records.

## Project structure

```
src/
  lib/supabaseClient.js   Supabase connection (public publishable key)
  services/               Data layer — auth, credit, loans, payments,
                          notifications, reminders
  context/AuthContext.jsx Session state for the whole app
  pages/                  Login, Register, Dashboard, Credit Score,
                          Payments, Loans & Dues, Score History,
                          Notifications, Improvement Plan, Profile
  components/             Navbar, Sidebar, score gauge, health bars, cards
supabase/
  01-schema.sql           Tables, RLS policies, profile trigger
  02-seed-demo.sql        Demo data for the demo account
```

## Setup

1. **Database** — in the Supabase project, run `supabase/01-schema.sql`
   (SQL Editor or a Postgres client). This creates all tables, security
   policies and the signup trigger.
2. **Auth setting** — Supabase dashboard → Authentication → Providers →
   Email → turn **"Confirm email" OFF** (the app uses email + password
   login only).
3. **Install & run**

   ```bash
   npm install
   npm run dev
   ```

   The app connects to the Team 2 Supabase project by default (see
   `src/lib/supabaseClient.js`). To use a different project, copy
   `.env.example` to `.env.local` and set your own URL + publishable key.

4. **Demo data (optional)** — register the demo account
   `demo@crediguide.app` in the app, then run `supabase/02-seed-demo.sql`.
   The seeded credit score is labelled in the app as
   "Demo data (prototype)".

## Features

- Email + password registration and login (Supabase Auth sessions)
- Credit score gauge (300–900) with status and score source
- Credit health breakdown — payment history, credit utilisation,
  credit age, credit accounts
- Score history chart from real score records
- Loans & dues — add / edit / close / delete, progress tracking,
  7 loan types
- Payments — add credit-card bills and EMIs, mark as paid,
  payment history
- In-app notifications with automatic due-date reminders
  (loans: 15/10/7/3/1/0 days before due + overdue;
  payments: 7/3/1/0 days + overdue)
- Personalised improvement plan generated from the user's own
  credit-health factors

## Future scope

- Integration with an authorised credit-information provider for live
  credit scores
- Background (scheduled) reminder generation and email reminders
