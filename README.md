# Rooty 🌱

A web-based learning platform inspired by Duolingo that helps students learn **Latin and Greek word roots** through Christmas-themed daily challenges.

## Project Overview

Rooty is a lightweight web app built with:
- **Frontend:** React + Vite + TypeScript
- **Styling:** Plain CSS Modules (no Tailwind)
- **Backend:** Supabase (Postgres + Auth + RPC functions)
- **Deployment:** Browser-hosted (Vercel for frontend, Supabase for backend)

## Features

- **Two user roles:** admin and learner
- **Authentication** using Supabase
- **50 Christmas-themed root entries** in the database
- **Daily Challenges** - 5 challenges per day with Christmas theme
- **Weekly themed quizzes** for learning
- **Review system** for mistakes
- **Progress tracking** with stats and streaks

## Team

- **Gabriel** — Project scaffold, CI, routing, Supabase client, AuthContext, Sprint 4 integration & deployment
- **Nick** — Frontend UX: Learn, Review, Profile pages, API calls, user flow, Daily Challenges
- **Nelson** — Database schema, RLS, RPC, and seeding the 50 Christmas roots
- **Benjamin** — Admin console, CRUD validation, docs, and tests

## Quick Start

```bash
npm install
npm run db:seed        # loads Christmas theme with 50 roots
npm run dev           # start local server
```

### Production Seeding

To seed the production database:

1. Set up environment variables in `.env.local`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Run the seed script:
   ```bash
   npm run db:seed
   ```

3. Verify in Supabase dashboard:
   - Christmas theme exists
   - 50 roots are created
   - theme_roots relationships are established

**Note:** The service role key bypasses RLS and should be kept secret. Never commit it to version control.

## Architecture

### Frontend
- Framework: React (Vite + TypeScript)
- Routing: React Router
- Styling: Plain CSS Modules
- Supabase client imported via `lib/supabase.ts`

### Backend (Supabase)
- Tables: profiles, themes, roots, theme_roots, attempts, wrong_queue
- Row-Level Security (RLS) for role-based access
- RPC functions for data operations

## Development

This project is for an *Intro to Software Engineering* course, demonstrating:
- Working connection between frontend and backend
- Proper use of React + Supabase
- Clean, documented software engineering practices

---

*Built with ❤️ for learning Latin and Greek word roots*
