# Rooty Database Migration Testing Checklist

Use this checklist to verify all migrations have been applied correctly and the database is functioning as expected.

## Pre-Migration Checklist

- [ ] Database schema is applied (`supabase/schema.sql`)
- [ ] RLS policies are enabled (`supabase/policies.sql`)
- [ ] RPC functions exist (`supabase/rpc.sql`)
- [ ] Indexes are created (`supabase/indexes.sql`)
- [ ] Seed data has been loaded (`npm run db:seed`)

## Post-Migration Verification

### 1. Verify RPC Function Security Levels

Run this query in Supabase SQL Editor:

```sql
SELECT 
    p.proname as function_name,
    CASE 
        WHEN p.prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_level,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE 'rpc_%'
ORDER BY p.proname;
```

**Expected Results**:
- ✅ `rpc_get_themes()` → SECURITY INVOKER
- ✅ `rpc_get_session(integer, integer)` → SECURITY INVOKER
- ✅ `rpc_get_review(integer)` → SECURITY INVOKER
- ✅ `rpc_stats_overview()` → SECURITY INVOKER
- ✅ `rpc_submit_attempt(integer, integer, boolean, text)` → SECURITY DEFINER

### 2. Verify GRANT Statements

Run this query:

```sql
SELECT 
    p.proname as function_name,
    r.rolname as granted_to,
    has_function_privilege(r.rolname, p.oid, 'EXECUTE') as can_execute
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
CROSS JOIN pg_roles r
WHERE n.nspname = 'public'
AND p.proname LIKE 'rpc_%'
AND r.rolname IN ('authenticated', 'anon')
ORDER BY p.proname, r.rolname;
```

**Expected Results**:
- All functions should have `can_execute = true` for `authenticated` role
- All functions should have `can_execute = false` for `anon` role

### 3. Verify Admin RLS Policies

Run this query:

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
AND policyname LIKE '%admin%'
ORDER BY tablename, policyname;
```

**Expected Results**:
- ✅ `attempts_admin_manage` policy exists
- ✅ `wrong_queue_admin_manage` policy exists
- Both policies should have `cmd = 'ALL'` and check for admin role

### 4. Test RPC Functions (as Authenticated User)

**Note**: These tests require an authenticated user session. Use Supabase client or SQL Editor with service_role key.

#### Test rpc_get_themes()
```sql
SELECT * FROM rpc_get_themes();
```
**Expected**: Returns list of themes including "Christmas Special"

#### Test rpc_get_session()
```sql
-- Get Christmas theme ID first
SELECT id FROM themes WHERE name = 'Christmas Special';

-- Then test (replace <theme_id> with actual ID)
SELECT * FROM rpc_get_session(<theme_id>, 10);
```
**Expected**: Returns up to 10 random roots from Christmas theme

#### Test rpc_submit_attempt()
```sql
-- Replace <root_id> and <theme_id> with actual IDs
SELECT * FROM rpc_submit_attempt(
    <root_id>,  -- root_id_param
    <theme_id>, -- theme_id_param
    false,      -- is_correct_param
    'test answer' -- user_answer_param
);
```
**Expected**: Returns JSON with `success: true` and `attempt_id`

#### Test rpc_get_review()
```sql
SELECT * FROM rpc_get_review(10);
```
**Expected**: Returns wrong_queue items for current user (or empty if none)

#### Test rpc_stats_overview()
```sql
SELECT * FROM rpc_stats_overview();
```
**Expected**: Returns JSON with stats:
- `success: true`
- `total_attempts: <number>`
- `correct_attempts: <number>`
- `accuracy_percent: <number>`
- `roots_learned: <number>`
- `current_streak: <number>`

### 5. Test Admin Access

**Prerequisites**: Create a test admin user:
1. Sign up via app (creates learner)
2. In Supabase Dashboard → Table Editor → `profiles`
3. Update user's `role` to `'admin'`

#### As Admin User:
```sql
-- Should be able to read all attempts
SELECT COUNT(*) as total_attempts FROM attempts;

-- Should be able to read all wrong_queue entries
SELECT COUNT(*) as total_wrong_queue FROM wrong_queue;

-- Should be able to read all profiles
SELECT COUNT(*) as total_profiles FROM profiles;
```

**Expected**: All queries return counts (not 0 or error)

#### As Learner User:
```sql
-- Should only see own attempts
SELECT COUNT(*) as my_attempts FROM attempts;

-- Should only see own wrong_queue entries
SELECT COUNT(*) as my_wrong_queue FROM wrong_queue;
```

**Expected**: Only returns counts for the authenticated user's own data

### 6. Verify Christmas Theme Exists

```sql
SELECT id, name, week_start, description 
FROM themes 
WHERE name = 'Christmas Special';
```

**Expected**: Returns 1 row with Christmas Special theme

```sql
-- Verify roots are linked to theme
SELECT COUNT(*) as linked_roots
FROM theme_roots tr
JOIN themes t ON tr.theme_id = t.id
WHERE t.name = 'Christmas Special';
```

**Expected**: Returns 50+ (number of roots linked to Christmas theme)

### 7. Test Frontend Integration

After applying migrations, test the frontend:

- [ ] **Home Page**: Daily challenges section loads
- [ ] **Learn Page**: Christmas Special theme appears
- [ ] **Session Page**: Quiz loads with 10 questions
- [ ] **Review Page**: Wrong answers appear (if any)
- [ ] **Profile Page**: Stats display correctly
- [ ] **Admin Page**: Can view all 50 roots (as admin)

## Common Issues & Solutions

### Issue: "Permission denied" when running migrations
**Solution**: 
- Ensure you're using service_role key or have superuser access
- Check that RLS is not blocking your access during migration

### Issue: Functions still show SECURITY DEFINER
**Solution**: 
- Check migration guards - they may be preventing updates
- Verify function exists before migration runs
- Try dropping and recreating function manually

### Issue: Admin cannot read all attempts
**Solution**:
- Verify admin policy was created: `SELECT * FROM pg_policies WHERE policyname = 'attempts_admin_manage';`
- Verify user's profile has `role = 'admin'`
- Check policy USING clause matches admin check pattern

### Issue: RPC function returns empty results
**Solution**:
- Check if user is authenticated (for auth-required functions)
- Verify RLS policies allow access
- Check function security level (INVOKER vs DEFINER)
- Verify data exists in tables

### Issue: Frontend shows errors after migration
**Solution**:
- Check browser console for RPC call errors
- Verify function signatures match frontend expectations
- Check network tab for failed API calls
- Verify GRANT statements were applied

## Rollback Instructions

If migrations cause issues, you can rollback:

### Rollback RPC Security Changes
```sql
-- Re-run original rpc.sql file to restore SECURITY DEFINER
-- Or manually change functions back:
ALTER FUNCTION rpc_get_themes() SECURITY DEFINER;
ALTER FUNCTION rpc_get_session(INTEGER, INTEGER) SECURITY DEFINER;
ALTER FUNCTION rpc_get_review(INTEGER) SECURITY DEFINER;
ALTER FUNCTION rpc_stats_overview() SECURITY DEFINER;
```

### Rollback Admin Policies
```sql
DROP POLICY IF EXISTS attempts_admin_manage ON attempts;
DROP POLICY IF EXISTS wrong_queue_admin_manage ON wrong_queue;
```

## Success Criteria

All migrations are successful when:
- ✅ All RPC functions have correct security levels
- ✅ All functions have proper GRANT/REVOKE statements
- ✅ Admin policies exist and work correctly
- ✅ Admin users can read all data
- ✅ Learner users can only read own data
- ✅ All RPC functions work from frontend
- ✅ Christmas Special theme exists
- ✅ 50+ roots are linked to theme

---

*Testing checklist for Rooty database migrations*  
*Last updated: 2025-01-02*

