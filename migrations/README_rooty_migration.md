# Rooty Database Migrations

This directory contains database migration files to fix and enhance the Rooty database implementation according to Supabase AI recommendations.

## Migration Files

### 20250102120000_fix_rpc_security_levels.sql
**Purpose**: Fix RPC function security levels and add GRANT/REVOKE statements

**Changes**:
- Changes read-only RPC functions from `SECURITY DEFINER` to `SECURITY INVOKER`
- Adds explicit GRANT/REVOKE statements for all RPC functions
- Ensures RLS policies apply correctly to read operations

**Functions Updated**:
- `rpc_get_themes()` → SECURITY INVOKER
- `rpc_get_session()` → SECURITY INVOKER
- `rpc_get_review()` → SECURITY INVOKER
- `rpc_stats_overview()` → SECURITY INVOKER
- `rpc_submit_attempt()` → Remains SECURITY DEFINER (needs to write data)

**Safety**: Uses guards to skip if functions already have correct security level.

### 20250102120001_add_admin_rls_policies.sql
**Purpose**: Add missing admin RLS policies for attempts and wrong_queue tables

**Changes**:
- Adds `attempts_admin_manage` policy (admins can SELECT/UPDATE/DELETE all attempts)
- Adds `wrong_queue_admin_manage` policy (admins can SELECT/UPDATE/DELETE all wrong_queue entries)

**Why**: Admins need to read all user data for analytics and management purposes.

**Safety**: Uses guards to skip if policies already exist.

### 20250102120002_ensure_christmas_theme.sql
**Purpose**: Idempotent migration to ensure Christmas Special theme exists

**Changes**:
- Inserts "Christmas Special" theme if it doesn't exist
- Uses ON CONFLICT DO NOTHING pattern

**Note**: Seed script (`scripts/seed.mjs`) already handles this, but this migration provides database-level guarantee.

**Safety**: Idempotent - safe to run multiple times.

## How to Apply Migrations

### Option 1: Supabase Dashboard SQL Editor
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of each migration file
3. Run them in order (by timestamp)
4. Verify each migration completes successfully

### Option 2: Supabase CLI (if configured)
```bash
# Apply all migrations
supabase db push

# Or apply individual migration
psql $DATABASE_URL -f migrations/20250102120000_fix_rpc_security_levels.sql
```

### Option 3: Direct psql Connection
```bash
psql $SUPABASE_DB_URL -f migrations/20250102120000_fix_rpc_security_levels.sql
psql $SUPABASE_DB_URL -f migrations/20250102120001_add_admin_rls_policies.sql
psql $SUPABASE_DB_URL -f migrations/20250102120002_ensure_christmas_theme.sql
```

## Manual Verification Steps

After applying migrations, run these SQL queries to verify:

### 1. Verify RPC Function Security Levels
```sql
SELECT 
    p.proname as function_name,
    CASE 
        WHEN p.prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_level
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE 'rpc_%'
ORDER BY p.proname;
```

**Expected Results**:
- `rpc_get_themes` → SECURITY INVOKER
- `rpc_get_session` → SECURITY INVOKER
- `rpc_get_review` → SECURITY INVOKER
- `rpc_stats_overview` → SECURITY INVOKER
- `rpc_submit_attempt` → SECURITY DEFINER

### 2. Verify GRANT Statements
```sql
SELECT 
    p.proname as function_name,
    r.rolname as granted_to
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_proc_acl a ON p.oid = a.oid
JOIN pg_roles r ON a.grantee = r.oid
WHERE n.nspname = 'public'
AND p.proname LIKE 'rpc_%';
```

**Expected**: All RPC functions should have EXECUTE granted to `authenticated` role.

### 3. Verify Admin RLS Policies
```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('attempts', 'wrong_queue')
AND policyname LIKE '%admin%';
```

**Expected**: Should see `attempts_admin_manage` and `wrong_queue_admin_manage` policies.

### 4. Test RPC Functions (as authenticated user)
```sql
-- Test rpc_get_themes (should work without auth, but better with auth)
SELECT * FROM rpc_get_themes();

-- Test rpc_get_session (requires theme_id)
SELECT * FROM rpc_get_session(1, 10);

-- Test rpc_get_review (requires auth)
SELECT * FROM rpc_get_review(10);

-- Test rpc_stats_overview (requires auth)
SELECT * FROM rpc_stats_overview();

-- Test rpc_submit_attempt (requires auth)
SELECT * FROM rpc_submit_attempt(1, true, 1, 'test answer');
```

### 5. Test Admin Access
As an admin user (role='admin' in profiles table):
```sql
-- Should be able to read all attempts
SELECT COUNT(*) FROM attempts;

-- Should be able to read all wrong_queue entries
SELECT COUNT(*) FROM wrong_queue;
```

As a learner user (role='learner'):
```sql
-- Should only see own attempts
SELECT COUNT(*) FROM attempts; -- Should match user's own count

-- Should only see own wrong_queue entries
SELECT COUNT(*) FROM wrong_queue; -- Should match user's own count
```

### 6. Verify Christmas Theme Exists
```sql
SELECT id, name, week_start, description 
FROM themes 
WHERE name = 'Christmas Special';
```

**Expected**: Should return 1 row with Christmas Special theme.

```sql
-- Verify roots are linked to theme
SELECT COUNT(*) 
FROM theme_roots tr
JOIN themes t ON tr.theme_id = t.id
WHERE t.name = 'Christmas Special';
```

**Expected**: Should return 50+ (number of roots linked to Christmas theme).

## Safety Notes

### SECURITY DEFINER Functions
- `rpc_submit_attempt()` uses SECURITY DEFINER because it needs to write data
- This function is owned by the deployer by default
- **Recommendation**: Change ownership to `postgres` for better security:
  ```sql
  ALTER FUNCTION public.rpc_submit_attempt(integer, integer, boolean, text) OWNER TO postgres;
  ```
- Document this in your deployment notes

### RLS Policy Rollout
- Migrations use guards to prevent errors if policies already exist
- If RLS is enabled but policies are missing, the database may deny access
- Ensure you have admin access (service_role key) when applying migrations
- Test with a learner account after applying to ensure policies work correctly

### Rollback
If you need to rollback:
1. **RPC Functions**: Re-run `supabase/rpc.sql` to restore original security levels
2. **RLS Policies**: Drop admin policies:
   ```sql
   DROP POLICY IF EXISTS attempts_admin_manage ON attempts;
   DROP POLICY IF EXISTS wrong_queue_admin_manage ON wrong_queue;
   ```

## Troubleshooting

### Issue: "Permission denied" when running migrations
**Solution**: Ensure you're using service_role key or have superuser access.

### Issue: Functions still show SECURITY DEFINER after migration
**Solution**: Check if migration guards are preventing updates. Temporarily remove guards and re-run.

### Issue: Admin cannot read all attempts
**Solution**: Verify admin policy was created and user's profile has role='admin'.

### Issue: RPC function returns empty results
**Solution**: 
- Check if user is authenticated (for auth-required functions)
- Verify RLS policies allow access
- Check function security level (INVOKER vs DEFINER)

## Related Files

- `supabase/schema.sql` - Database schema
- `supabase/policies.sql` - Original RLS policies
- `supabase/rpc.sql` - Original RPC functions
- `scripts/seed.mjs` - Seed script for Christmas theme and roots

---

*Created for Rooty database implementation fixes*  
*Last updated: 2025-01-02*

