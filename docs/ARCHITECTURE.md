# Rooty Architecture Documentation

This document describes the architecture and key design decisions for the Rooty learning platform.

## Overview

Rooty is a React-based web application for learning Latin and Greek word roots, featuring daily challenges, progress tracking, and an admin management console.

## Technology Stack

- **Frontend:** React 19 + Vite + TypeScript
- **Styling:** Plain CSS Modules (no Tailwind)
- **Backend:** Supabase (PostgreSQL + Auth + RPC functions)
- **Deployment:** Vercel (frontend) + Supabase (backend)
- **Routing:** React Router v7

## Project Structure

```
Rooty/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── QuizCard/
│   │   └── ...
│   ├── context/             # React context providers
│   │   └── AuthContext.tsx
│   ├── lib/                 # Utility libraries
│   │   ├── api.ts           # API wrapper functions
│   │   ├── challenges.ts    # Daily challenge utilities
│   │   └── supabase.ts      # Supabase client
│   ├── pages/               # Page components
│   │   ├── Home.tsx
│   │   ├── Auth.tsx
│   │   ├── Learn.tsx
│   │   ├── Session.tsx
│   │   ├── Review.tsx
│   │   ├── Profile.tsx
│   │   └── Admin.tsx
│   ├── styles/              # Global styles
│   │   ├── variables.css
│   │   └── globals.css
│   ├── App.tsx              # Root component with routing
│   └── main.tsx             # Entry point
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
│   └── seed.mjs            # Database seeding script
├── supabase/                # Database files
│   ├── schema.sql
│   ├── policies.sql
│   ├── rpc.sql
│   └── seeds/
└── public/                  # Static assets
```

## Key Features

### 1. Daily Challenges System

**Location:** `src/lib/challenges.ts`, `src/pages/Home.tsx`

**Architecture:**
- Uses localStorage to track challenge completion
- 5 challenges per day (hardcoded)
- Challenge completion persists across sessions
- Christmas theme ID is cached after first fetch

**Flow:**
1. User clicks challenge card → Navigate to `/session?theme=<id>&challenge=<num>`
2. Complete 10 questions in quiz session
3. On completion → `markChallengeComplete()` saves to localStorage
4. Return to Home → Challenge shows as completed

**Storage Format:**
```json
{
  "completed": [1, 2, 3, 4, 5],
  "date": "2024-12-20T10:00:00.000Z"
}
```

### 2. Authentication & Authorization

**Location:** `src/context/AuthContext.tsx`, `src/components/ProtectedAdminRoute.tsx`

**Architecture:**
- Supabase Auth handles authentication
- Profile table extends auth.users with role field
- Role-based access control (admin vs learner)
- Protected routes use React Router + AuthContext

**Flow:**
1. User signs up → Supabase creates auth user
2. AuthContext creates profile with "learner" role
3. Admin role set manually in database
4. ProtectedAdminRoute checks role before rendering

### 3. API Layer

**Location:** `src/lib/api.ts`

**Architecture:**
- Wrapper functions for all Supabase RPC calls
- Consistent error handling
- User-friendly error messages
- Type-safe responses

**Functions:**
- `getThemes()` - Fetch all themes
- `getSession(themeId, limit)` - Get quiz roots
- `submitAttempt(...)` - Record quiz attempt
- `getReview(limit)` - Get wrong queue items
- `getStatsOverview()` - Get user statistics

**Error Handling:**
- All functions return `{ data, error }` pattern
- Errors logged with `console.error`
- User-friendly error messages
- Network error handling

### 4. Quiz Session Flow

**Location:** `src/pages/Session.tsx`, `src/components/QuizCard/`

**Architecture:**
- State management for current question index
- Score tracking
- Challenge completion detection
- Navigation after completion

**Flow:**
1. Load session roots via `getSession()`
2. Display question via QuizCard component
3. User answers → `submitAttempt()` called
4. Update score and move to next question
5. On last question → Show completion screen
6. If challenge param exists → Mark challenge complete
7. Navigate back to Home

### 5. Review System

**Location:** `src/pages/Review.tsx`

**Architecture:**
- Fetches items from wrong_queue via `getReview()`
- Displays roots that were answered incorrectly
- Quiz interface for reviewing mistakes
- Correct answers remove items from queue

**Flow:**
1. Load review queue via `getReview()`
2. Display roots with incorrect count
3. User reviews → `submitAttempt()` called
4. Correct answers remove from queue (handled by RPC)
5. Continue until queue empty or session complete

### 6. Statistics & Progress Tracking

**Location:** `src/pages/Profile.tsx`, `src/lib/api.ts`

**Architecture:**
- RPC function calculates statistics
- Streak calculation uses gap-and-island pattern
- Real-time updates after quiz sessions

**Metrics:**
- Total attempts
- Correct attempts
- Accuracy percentage
- Roots learned (unique correct roots)
- Current streak (consecutive days)

### 7. Admin Console

**Location:** `src/pages/Admin.tsx`

**Architecture:**
- Protected route (admin only)
- Fetches Christmas theme roots
- Inline editing with form validation
- JSONB examples field handling

**Flow:**
1. Check admin role → Load Christmas theme
2. Fetch roots linked to theme
3. Display in editable table
4. Edit → Validate → Save → Update local state

## Data Flow

### Challenge Completion Flow
```
User clicks challenge
  → Navigate to /session?theme=X&challenge=Y
  → Load session roots
  → Complete 10 questions
  → Submit attempts (RPC)
  → Mark challenge complete (localStorage)
  → Navigate to Home
  → Challenge shows as completed
```

### Quiz Attempt Flow
```
User answers question
  → submitAttempt() called
  → RPC function executes
  → Insert into attempts table
  → If incorrect: Add/update wrong_queue
  → If correct: Remove from wrong_queue
  → Update local score state
  → Move to next question
```

### Statistics Flow
```
User navigates to Profile
  → getStatsOverview() called
  → RPC function calculates stats
  → Returns aggregated data
  → Display in UI components
```

## State Management

- **Local State:** React useState hooks for component state
- **Global State:** AuthContext for user/auth state
- **Persistence:** localStorage for challenge completion
- **Server State:** Supabase RPC functions for data

## Security

- **Authentication:** Supabase Auth
- **Authorization:** Row-Level Security (RLS) policies
- **Role-Based Access:** Admin vs learner roles
- **Protected Routes:** React Router + AuthContext checks
- **RPC Security:** SECURITY DEFINER with search_path protection

## Performance Considerations

- **Theme ID Caching:** Christmas theme ID cached after first fetch
- **Lazy Loading:** Components loaded on demand
- **Error Boundaries:** Error handling at API layer
- **Responsive Design:** Mobile-first approach

## Future Enhancements

- [ ] Add unit tests (Vitest/React Testing Library)
- [ ] Add E2E tests (Playwright/Cypress)
- [ ] Implement challenge reset on new day
- [ ] Add more themes beyond Christmas
- [ ] Implement offline support
- [ ] Add push notifications for daily challenges

---

*Created for Sprint 4: Final Integration, Polish & Deployment*

