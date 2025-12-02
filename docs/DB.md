# Rooty Database Documentation

## Overview

The Rooty database is built on Supabase (PostgreSQL) and contains the core data for the Latin/Greek word roots learning platform.

## Database Schema

### Tables

#### `profiles`
Extends Supabase auth.users with role-based access control.
- `id` (UUID, PK) - References auth.users(id)
- `role` (ENUM) - 'admin' or 'learner'
- `display_name` (TEXT) - User's display name
- `created_at`, `updated_at` (TIMESTAMP)

#### `themes`
Weekly learning themes for organizing roots.
- `id` (SERIAL, PK)
- `name` (TEXT) - Theme name (e.g., "Week 1: Nature Roots")
- `week_start` (DATE) - Start date of the theme
- `description` (TEXT) - Theme description
- `created_at`, `updated_at` (TIMESTAMP)

#### `roots`
Core learning content - Latin and Greek word roots.
- `id` (SERIAL, PK)
- `root_text` (TEXT, UNIQUE) - The root word (e.g., "aqua")
- `origin_lang` (TEXT) - Language of origin ("Latin" or "Greek")
- `meaning` (TEXT) - English meaning
- `examples` (JSONB) - Array of example words
- `source_title` (TEXT) - Source reference title
- `source_url` (TEXT) - Source reference URL
- `created_at`, `updated_at` (TIMESTAMP)

#### `theme_roots`
Junction table linking themes to roots.
- `theme_id` (INTEGER, FK) - References themes(id)
- `root_id` (INTEGER, FK) - References roots(id)
- Primary Key: (theme_id, root_id)

#### `attempts`
Quiz attempt history for tracking progress.
- `id` (SERIAL, PK)
- `user_id` (UUID, FK) - References profiles(id)
- `root_id` (INTEGER, FK) - References roots(id)
- `theme_id` (INTEGER, FK) - References themes(id)
- `is_correct` (BOOLEAN) - Whether the answer was correct
- `user_answer` (TEXT) - User's submitted answer
- `created_at` (TIMESTAMP)

#### `wrong_queue`
Mistakes that need review.
- `user_id` (UUID, FK) - References profiles(id)
- `root_id` (INTEGER, FK) - References roots(id)
- `queued_at` (TIMESTAMP, DEFAULT NOW()) - When first added to queue
- `last_seen_at` (TIMESTAMP, DEFAULT NOW()) - Last review attempt
- `times_incorrect` (INTEGER, DEFAULT 1) - Count of incorrect attempts
- Primary Key: (user_id, root_id)

## Row-Level Security (RLS)

### Access Patterns

**Learners:**
- Can read all themes and roots
- Can create/read/update/delete their own attempts and wrong_queue entries
- Cannot modify themes or roots

**Admins:**
- Full CRUD access to themes and roots
- Can read all user data for analytics
- Can manage theme-root relationships

## Database Indexes

The following indexes are created for optimal query performance:

- `idx_attempts_user_id` - Index on `attempts(user_id)` for filtering user attempts
- `idx_wrong_queue_user_root` - Composite index on `wrong_queue(user_id, root_id)` for efficient lookups
- `idx_theme_roots_theme_id` - Index on `theme_roots(theme_id)` for filtering roots by theme
- `idx_attempts_root_id` - Index on `attempts(root_id)` for root-based queries
- `idx_theme_roots_root_id` - Index on `theme_roots(root_id)` for reverse lookups
- `idx_wrong_queue_user_id` - Index on `wrong_queue(user_id)` for user-based queries

Indexes are defined in `supabase/indexes.sql` and can be applied independently.

## RPC Functions

All RPC functions use `SECURITY DEFINER` with `SET search_path = public` for security. User authentication is handled by wrapping `auth.uid()` calls in `(SELECT auth.uid())` to prevent security issues.

### `rpc_get_themes()`
Returns all themes ordered by week_start date.
- **Security**: Uses `SECURITY DEFINER` with search_path
- **Authentication**: Not required (public data)
```sql
SELECT id, name, week_start, description, created_at 
FROM themes 
ORDER BY week_start DESC;
```

### `rpc_get_session(theme_id_param, limit_count)`
Returns random roots for a quiz session.
- **Security**: Uses `SECURITY DEFINER` with search_path
- **Authentication**: Not required (public data)
- If `theme_id_param` is NULL, returns random roots from all roots
- If provided, returns random roots from that specific theme
- Default limit: 10 roots

### `rpc_submit_attempt(root_id_param, theme_id_param, is_correct_param, user_answer_param)`
Records a quiz attempt and updates the wrong queue.
- **Security**: Uses `SECURITY DEFINER` with search_path
- **Authentication**: Required - returns JSON error if unauthenticated
- **Auth handling**: Uses `(SELECT auth.uid())` wrapped in local variable
- Inserts attempt record
- If incorrect: adds/updates wrong_queue entry (increments `times_incorrect`)
- If correct: removes from wrong_queue
- Returns JSON response with success status, attempt_id, and message

### `rpc_get_review(limit_count)`
Returns user's wrong queue items for review.
- **Security**: Uses `SECURITY DEFINER` with search_path
- **Authentication**: Required - returns empty set if unauthenticated
- **Auth handling**: Uses `(SELECT auth.uid())` wrapped in local variable
- Only returns items for the authenticated user
- Ordered by times_incorrect (desc) and queued_at (asc)
- Default limit: 10 items
- Returns empty result set for unauthenticated users (no data leaks)

### `rpc_stats_overview()`
Returns user statistics for the profile dashboard.
- **Security**: Uses `SECURITY DEFINER` with search_path
- **Authentication**: Required - returns JSON error if unauthenticated
- **Auth handling**: Uses `(SELECT auth.uid())` wrapped in local variable
- **Streak calculation**: Uses gap-and-island pattern for consecutive calendar days
- Returns JSON response with:
  - `success` (boolean)
  - `total_attempts` (integer)
  - `correct_attempts` (integer)
  - `accuracy_percent` (numeric) - rounded to 1 decimal place
  - `roots_learned` (integer) - unique roots answered correctly
  - `current_streak` (integer) - consecutive calendar days with at least one attempt

#### Streak Calculation Logic

The streak calculation uses a **gap-and-island pattern** to count consecutive calendar days where the user has made at least one attempt (regardless of correctness). The algorithm:

1. Groups attempts by calendar date (distinct dates only)
2. Orders dates descending (most recent first)
3. Uses row numbering to identify consecutive day groups
4. Counts the size of the most recent consecutive group

**Example:**
- Attempts on: Dec 20, Dec 19, Dec 18, Dec 16, Dec 15
- Streak = 2 (Dec 20 and Dec 19 are consecutive; gap on Dec 17 breaks the streak)

**Edge cases:**
- No attempts: streak = 0
- Only today: streak = 1
- Gap in dates: streak resets to count from most recent date

## Seeding

The database is seeded with exactly 100 root entries using the `scripts/seed.mjs` script.

### Sample Data Structure
```json
{
  "root_text": "aqua",
  "origin_lang": "Latin",
  "meaning": "water",
  "examples": ["aquarium", "aquatic"],
  "source_title": "Oxford Etymology Dictionary",
  "source_url": "https://www.oxfordreference.com/..."
}
```

### Running the Seed
```bash
# Set up environment variables
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# Run the seed script
npm run db:seed
```

## Security Considerations

1. **RLS Policies**: All tables have Row-Level Security enabled
2. **Role-Based Access**: Admin/learner roles control data access
3. **User Isolation**: Users can only access their own attempts and wrong_queue
4. **Source Validation**: All roots require source_title and source_url
5. **Service Role**: Seed script uses service role key (bypasses RLS)
6. **RPC Security**: All RPC functions use `SECURITY DEFINER` with `SET search_path = public` to prevent search_path attacks
7. **Auth Wrapping**: `auth.uid()` calls are wrapped in `(SELECT auth.uid())` and assigned to local variables to prevent security issues in SECURITY DEFINER functions
8. **Unauthenticated Handling**: RPC functions explicitly check for NULL user_id and return appropriate responses (empty set or JSON error)

## Development Notes

- The roots dataset is fixed at 100 entries (no live updates)
- Themes are created manually by admins
- Wrong queue automatically manages based on quiz attempts
- All timestamps use UTC timezone
- JSONB examples field allows flexible example storage

## Regenerating Supabase Types

After making database schema changes, regenerate TypeScript types:

```bash
npm run gen:types
```

This command uses Supabase CLI to generate types from your database schema.

## Testing

SQL test suite is available in `tests/sql/sprint3_test.sql` covering:
- RPC function authentication handling
- Streak calculation edge cases
- Wrong queue operations
- Index verification
- RLS policy verification

Run tests in a test database environment before deploying to production.

---

*Created by Nelson for the Rooty learning platform*  
*Updated for Sprint 3: Database Fixes & RPC Alignment*
