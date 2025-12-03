# Rooty Database Migration Summary

## Analysis Results

### What Already Exists ✅

1. **Schema** (`supabase/schema.sql`)
   - All tables defined correctly
   - Proper foreign keys and constraints
   - Indexes created

2. **RLS Policies** (`supabase/policies.sql`)
   - All tables have RLS enabled
   - User-level policies exist for attempts and wrong_queue
   - Admin policies exist for themes, roots, theme_roots

3. **RPC Functions** (`supabase/rpc.sql`)
   - All 5 required functions exist:
     - `rpc_get_themes()`
     - `rpc_get_session()`
     - `rpc_submit_attempt()`
     - `rpc_get_review()`
     - `rpc_stats_overview()`

4. **Seed Data**
   - 55 roots in `supabase/seeds/roots.seed.json` (spec requires 50, so this is fine)
   - Seed script creates "Christmas Special" theme
   - All roots linked to theme

### What Was Fixed ❌ → ✅

#### 1. RPC Function Security Levels
**Issue**: Read-only functions used `SECURITY DEFINER` instead of `SECURITY INVOKER`

**Fixed Functions**:
- `rpc_get_themes()` → Changed to SECURITY INVOKER
- `rpc_get_session()` → Changed to SECURITY INVOKER
- `rpc_get_review()` → Changed to SECURITY INVOKER
- `rpc_stats_overview()` → Changed to SECURITY INVOKER
- `rpc_submit_attempt()` → Kept as SECURITY DEFINER (correct - needs to write)

**Migration**: `20250102120000_fix_rpc_security_levels.sql`

#### 2. Missing GRANT/REVOKE Statements
**Issue**: No explicit permission grants found

**Fixed**: Added GRANT/REVOKE statements for all 5 RPC functions:
- `GRANT EXECUTE ... TO authenticated`
- `REVOKE EXECUTE ... FROM anon`

**Migration**: `20250102120000_fix_rpc_security_levels.sql`

#### 3. Missing Admin RLS Policies
**Issue**: Admins could not read all attempts/wrong_queue entries

**Fixed**: Added admin policies:
- `attempts_admin_manage` - Allows admins to SELECT/UPDATE/DELETE all attempts
- `wrong_queue_admin_manage` - Allows admins to SELECT/UPDATE/DELETE all wrong_queue entries

**Migration**: `20250102120001_add_admin_rls_policies.sql`

#### 4. RPC Function Return Structure
**Issue**: `rpc_get_review()` returned `root_id` instead of `id`, missing `created_at`

**Fixed**: Updated return structure to match `ReviewRoot` interface:
- Changed `root_id` → `id`
- Added `created_at` field
- Maintains all Root fields plus `times_incorrect` and `queued_at`

**Migration**: `20250102120000_fix_rpc_security_levels.sql`

#### 5. Migration File Structure
**Issue**: No timestamped migration files

**Fixed**: Created migration directory with:
- Timestamped migration files
- Guards to prevent duplicate execution
- Comprehensive documentation

## Migration Files Created

1. **20250102120000_fix_rpc_security_levels.sql**
   - Fixes RPC security levels
   - Adds GRANT/REVOKE statements
   - Fixes rpc_get_review return structure

2. **20250102120001_add_admin_rls_policies.sql**
   - Adds admin policies for attempts and wrong_queue

3. **20250102120002_ensure_christmas_theme.sql**
   - Idempotent migration to ensure Christmas theme exists

4. **README_rooty_migration.md**
   - Comprehensive documentation
   - How to apply migrations
   - Verification steps

5. **TESTING_CHECKLIST.md**
   - Step-by-step testing guide
   - SQL verification queries
   - Troubleshooting guide

## Items Skipped (Already Correct)

- Schema tables - all correct
- Basic RLS policies - all exist
- RPC function implementations - logic is correct
- Seed data - 55 roots (more than required 50)
- Indexes - all exist

## Manual Steps Required

1. **Apply Migrations**:
   - Run migrations in order (by timestamp)
   - Use Supabase Dashboard SQL Editor or psql

2. **Verify Function Ownership** (Optional but recommended):
   ```sql
   ALTER FUNCTION public.rpc_submit_attempt(INTEGER, INTEGER, BOOLEAN, TEXT) OWNER TO postgres;
   ```

3. **Test Admin Access**:
   - Create admin user (set role='admin' in profiles table)
   - Verify admin can read all attempts/wrong_queue

4. **Test Frontend**:
   - Verify all RPC calls work
   - Test admin console functionality

## Safety Notes

- All migrations use guards to prevent errors if items already exist
- Migrations are idempotent (safe to run multiple times)
- SECURITY DEFINER function (`rpc_submit_attempt`) should have owner changed to `postgres` for better security
- Admin policies allow full access - ensure only trusted users have admin role

## Next Steps

1. Review migration files
2. Apply migrations to database
3. Run verification queries from TESTING_CHECKLIST.md
4. Test frontend functionality
5. Update production database if tests pass

---

*Migration summary created: 2025-01-02*  
*All migrations ready for review and application*

