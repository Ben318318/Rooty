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
- `queued_at` (TIMESTAMP) - When first added to queue
- `last_seen_at` (TIMESTAMP) - Last review attempt
- `times_incorrect` (INTEGER) - Count of incorrect attempts
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

## RPC Functions

### `rpc_get_themes()`
Returns all themes ordered by week_start date.
```sql
SELECT id, name, week_start, description, created_at 
FROM themes 
ORDER BY week_start DESC;
```

### `rpc_get_session(theme_id_param, limit_count)`
Returns random roots for a quiz session.
- If `theme_id_param` is NULL, returns random roots from all roots
- If provided, returns random roots from that specific theme
- Default limit: 10 roots

### `rpc_submit_attempt(root_id_param, theme_id_param, is_correct_param, user_answer_param)`
Records a quiz attempt and updates the wrong queue.
- Inserts attempt record
- If incorrect: adds/updates wrong_queue entry
- If correct: removes from wrong_queue
- Returns JSON response with success status

### `rpc_get_review(limit_count)`
Returns user's wrong queue items for review.
- Only returns items for the authenticated user
- Ordered by times_incorrect (desc) and queued_at (asc)
- Default limit: 10 items

### `rpc_stats_overview()`
Returns user statistics for the profile dashboard.
- Total attempts and correct attempts
- Accuracy percentage
- Number of unique roots learned
- Current streak count
- Returns JSON response

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

## Development Notes

- The roots dataset is fixed at 100 entries (no live updates)
- Themes are created manually by admins
- Wrong queue automatically manages based on quiz attempts
- All timestamps use UTC timezone
- JSONB examples field allows flexible example storage

---

*Created by Nelson for the Rooty learning platform*
