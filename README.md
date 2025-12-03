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
- **50 Christmas-themed word roots** with multiple-choice quiz format
- **50 traditional Latin/Greek roots** for learning
- **Weekly themed quizzes** for learning
- **Progress tracking** with stats and streaks
- **4 daily challenges** per day

## Team

- **Gabriel** — Project scaffold, CI, routing, Supabase client, AuthContext
- **Nick** — Frontend UX: Learn, Review, Profile pages, API calls, user flow
- **Nelson** — Database schema, RLS, RPC, and seeding the 100 roots
- **Benjamin** — Admin console, CRUD validation, docs, and tests

## Quick Start

### Prerequisites

Before you begin, make sure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **pnpm** package manager
- A **Supabase account** and project set up
- Your Supabase project credentials (URL and API keys)

### Step-by-Step Setup

#### 1. Install Dependencies

```bash
npm install
# or if you prefer pnpm:
pnpm install
```

#### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory (copy from `env.example`):

```bash
# Windows PowerShell
Copy-Item env.example .env.local

# Mac/Linux
cp env.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find your Supabase credentials:**
1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

#### 3. Set Up Database

**Option A: Using Supabase SQL Editor (Recommended for new databases)**

1. Go to your Supabase Dashboard → **SQL Editor**
2. Run the SQL files in this order:
   - `supabase/schema.sql` - Creates all tables (including word_roots and theme_word_roots)
   - `supabase/policies.sql` - Sets up Row-Level Security
   - `supabase/rpc.sql` - Creates RPC functions (including rpc_get_word_session)
   - `supabase/indexes.sql` - Creates database indexes

**Option B: Using Migrations (For existing databases)**

If you already have a database set up and need to add the word-based quiz format, apply migrations in order:
- `migrations/20250102120000_fix_rpc_security_levels.sql`
- `migrations/20250102120001_add_admin_rls_policies.sql`
- `migrations/20250102120002_ensure_christmas_theme.sql`
- `migrations/20250103000000_add_word_roots_schema_and_rpc.sql` (adds word_roots tables and RPC functions)

#### 4. Seed the Database

Load the Christmas-themed roots into your database:

```bash
npm run db:seed
# or
pnpm db:seed
```

This will:
- Create the "Christmas Special" theme
- Insert 50 traditional Latin and Greek roots
- Insert 50 English word roots (for multiple-choice quiz format)
- Link all roots to the Christmas Special theme

**Verify seeding worked:**
- Check your Supabase Dashboard → **Table Editor** → `themes` table
- You should see "Christmas Special" theme
- Check `roots` table - should have 50 entries
- Check `word_roots` table - should have 50 entries

#### 5. Start the Development Server

```bash
npm run dev
# or
pnpm dev
```

You should see output like:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### 6. Open in Browser

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Rooty homepage! 🎉

### First Time Setup Checklist

- [ ] Node.js installed (v18+)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created with Supabase credentials
- [ ] Database schema applied (`schema.sql`, `policies.sql`, `rpc.sql`, `indexes.sql`)
- [ ] Database seeded (`npm run db:seed`)
- [ ] Dev server running (`npm run dev`)
- [ ] App opens in browser at `http://localhost:5173`

### Creating Your First User

1. Click **Sign In** on the homepage
2. Click **Sign up** to create a new account
3. Enter your email and password
4. You'll be automatically assigned the `learner` role

### Making Yourself an Admin (Optional)

To access the Admin Console:

1. Go to Supabase Dashboard → **Table Editor** → `profiles` table
2. Find your user profile (by email or user ID)
3. Edit the `role` field and change it from `learner` to `admin`
4. Refresh the app - you should now see the **Admin** link in navigation

### Troubleshooting

**"Missing Supabase credentials" error:**
- Make sure `.env.local` exists in the root directory
- Check that all three environment variables are set
- Restart the dev server after changing `.env.local`

**Database connection issues:**
- Verify your Supabase project is active
- Check that your API keys are correct
- Ensure RLS policies are applied correctly

**"Theme not found" or empty pages:**
- Run `npm run db:seed` to populate the database
- Check Supabase Dashboard → `themes` table for "Christmas Special"
- Verify `theme_roots` table has entries linking roots to theme
- Verify `word_roots` table has 50 entries
- Verify `theme_word_roots` table has entries linking word roots to theme

**"Function not found" errors (rpc_get_word_session):**
- Make sure you've run `migrations/20250103000000_add_word_roots_schema_and_rpc.sql`
- This migration creates the word_roots tables and RPC functions needed for the quiz
- Wait 10-30 seconds after running the migration for PostgREST cache to refresh

**Port already in use:**
- Vite will automatically try the next available port (5174, 5175, etc.)
- Or kill the process using port 5173:
  ```bash
  # Windows
  netstat -ano | findstr :5173
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:5173 | xargs kill
  ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run db:seed` - Seed database with Christmas roots
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report

## Architecture

### Frontend
- Framework: React (Vite + TypeScript)
- Routing: React Router
- Styling: Plain CSS Modules
- Supabase client imported via `lib/supabase.ts`

### Backend (Supabase)
- Tables: profiles, themes, roots, theme_roots, word_roots, theme_word_roots, attempts, wrong_queue
- Row-Level Security (RLS) for role-based access
- RPC functions for data operations
- Two quiz formats: traditional root-based and English word-based with multiple choice

## Development

This project is for an *Intro to Software Engineering* course, demonstrating:
- Working connection between frontend and backend
- Proper use of React + Supabase
- Clean, documented software engineering practices

---

*Built with ❤️ for learning Latin and Greek word roots*
