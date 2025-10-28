# Rooty 🌱

A web-based learning platform inspired by Duolingo that helps students learn **Latin and Greek word roots**.

## Project Overview

Rooty is a lightweight web app built with:
- **Frontend:** React + Vite + TypeScript
- **Styling:** Plain CSS Modules (no Tailwind)
- **Backend:** Supabase (Postgres + Auth + RPC functions)
- **Deployment:** Browser-hosted (Vercel for frontend, Supabase for backend)

## Features

- **Two user roles:** admin and learner
- **Authentication** using Supabase
- **100 preloaded root entries** in the database
- **Weekly themed quizzes** for learning
- **Review system** for mistakes
- **Progress tracking** with stats and streaks

## Team

- **Gabriel** — Project scaffold, CI, routing, Supabase client, AuthContext
- **Nick** — Frontend UX: Learn, Review, Profile pages, API calls, user flow
- **Nelson** — Database schema, RLS, RPC, and seeding the 100 roots
- **Benjamin** — Admin console, CRUD validation, docs, and tests

## Quick Start

```bash
pnpm install
pnpm db:seed        # loads fixed 100-root dataset
pnpm dev            # start local server
```

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
