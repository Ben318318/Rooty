-- Sprint 3 Test Suite
-- Database Fixes & RPC Alignment
-- Created by Nelson for Sprint 3
--
-- This test suite verifies:
-- 1. RPC functions handle authentication correctly
-- 2. Streak calculation works with gap-and-island pattern
-- 3. Wrong queue operations work correctly
-- 4. Indexes are present and functional
--
-- Note: These tests should be run in a test database environment
-- Some tests require authenticated users - adjust user IDs as needed

-- ============================================
-- Test 1: rpc_get_review - Authenticated User
-- ============================================
-- Expected: Returns roots from wrong_queue for authenticated user
-- Prerequisites: User must be authenticated and have wrong_queue entries

-- Test as authenticated user (replace with actual test user ID)
-- SELECT * FROM rpc_get_review(10);
-- Verify: Returns roots with times_incorrect and queued_at fields

-- ============================================
-- Test 2: rpc_get_review - Unauthenticated User
-- ============================================
-- Expected: Returns empty set
-- Prerequisites: No authentication context

-- Test without authentication
-- SELECT * FROM rpc_get_review(10);
-- Verify: Returns empty result set (no data leaks)

-- ============================================
-- Test 3: rpc_stats_overview - Authenticated User
-- ============================================
-- Expected: Returns JSON with stats including correct streak
-- Prerequisites: User must be authenticated and have attempts

-- Test as authenticated user
-- SELECT rpc_stats_overview();
-- Verify: Returns JSON with success=true, total_attempts, correct_attempts, accuracy_percent, roots_learned, current_streak

-- ============================================
-- Test 4: rpc_stats_overview - Unauthenticated User
-- ============================================
-- Expected: Returns JSON error
-- Prerequisites: No authentication context

-- Test without authentication
-- SELECT rpc_stats_overview();
-- Verify: Returns JSON with success=false and error message

-- ============================================
-- Test 5: Streak Calculation - Consecutive Days
-- ============================================
-- Expected: Streak counts consecutive calendar days with attempts
-- Prerequisites: User with attempts on consecutive days

-- Setup: Create test attempts on consecutive days
-- INSERT INTO attempts (user_id, root_id, is_correct, created_at) VALUES
--   ('<test_user_id>', 1, true, CURRENT_DATE - INTERVAL '2 days'),
--   ('<test_user_id>', 2, true, CURRENT_DATE - INTERVAL '2 days'),
--   ('<test_user_id>', 3, true, CURRENT_DATE - INTERVAL '1 day'),
--   ('<test_user_id>', 4, true, CURRENT_DATE);

-- Test: Call rpc_stats_overview
-- SELECT rpc_stats_overview();
-- Verify: current_streak = 3 (3 consecutive days)

-- ============================================
-- Test 6: Streak Calculation - Broken Streak
-- ============================================
-- Expected: Streak resets when there's a gap
-- Prerequisites: User with attempts that have gaps

-- Setup: Create test attempts with gap
-- INSERT INTO attempts (user_id, root_id, is_correct, created_at) VALUES
--   ('<test_user_id>', 1, true, CURRENT_DATE - INTERVAL '3 days'),
--   ('<test_user_id>', 2, true, CURRENT_DATE - INTERVAL '2 days'),
--   ('<test_user_id>', 3, true, CURRENT_DATE - INTERVAL '1 day'),
--   -- Gap of 1 day
--   ('<test_user_id>', 4, true, CURRENT_DATE);

-- Test: Call rpc_stats_overview
-- SELECT rpc_stats_overview();
-- Verify: current_streak = 1 (only today, streak broken)

-- ============================================
-- Test 7: Streak Calculation - Single Day
-- ============================================
-- Expected: Streak = 1 if only today has attempts
-- Prerequisites: User with attempts only today

-- Setup: Create test attempts only today
-- INSERT INTO attempts (user_id, root_id, is_correct, created_at) VALUES
--   ('<test_user_id>', 1, true, CURRENT_DATE);

-- Test: Call rpc_stats_overview
-- SELECT rpc_stats_overview();
-- Verify: current_streak = 1

-- ============================================
-- Test 8: Streak Calculation - No Attempts
-- ============================================
-- Expected: Streak = 0 if no attempts exist
-- Prerequisites: User with no attempts

-- Test: Call rpc_stats_overview for user with no attempts
-- SELECT rpc_stats_overview();
-- Verify: current_streak = 0

-- ============================================
-- Test 9: rpc_submit_attempt - Correct Answer
-- ============================================
-- Expected: Creates attempt, removes from wrong_queue
-- Prerequisites: User authenticated, root exists in wrong_queue

-- Setup: Add root to wrong_queue first
-- INSERT INTO wrong_queue (user_id, root_id) VALUES ('<test_user_id>', 1);

-- Test: Submit correct attempt
-- SELECT rpc_submit_attempt(1, NULL, true, 'test answer');
-- Verify: 
--   - Returns JSON with success=true
--   - Attempt created in attempts table
--   - Root removed from wrong_queue

-- ============================================
-- Test 10: rpc_submit_attempt - Incorrect Answer
-- ============================================
-- Expected: Creates attempt, adds/updates wrong_queue
-- Prerequisites: User authenticated, root exists

-- Test: Submit incorrect attempt
-- SELECT rpc_submit_attempt(1, NULL, false, 'wrong answer');
-- Verify:
--   - Returns JSON with success=true
--   - Attempt created in attempts table
--   - Root added to wrong_queue (or times_incorrect incremented if exists)

-- ============================================
-- Test 11: rpc_submit_attempt - Unauthenticated
-- ============================================
-- Expected: Returns JSON error
-- Prerequisites: No authentication context

-- Test: Submit attempt without authentication
-- SELECT rpc_submit_attempt(1, NULL, true, 'test');
-- Verify: Returns JSON with success=false and error message

-- ============================================
-- Test 12: Index Verification
-- ============================================
-- Expected: All required indexes exist
-- Prerequisites: Database schema applied

-- Check indexes exist
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_attempts_user_id',
    'idx_wrong_queue_user_root',
    'idx_theme_roots_theme_id'
  )
ORDER BY tablename, indexname;

-- Verify: All three indexes are present

-- ============================================
-- Test 13: wrong_queue Table Structure
-- ============================================
-- Expected: Correct PK and defaults
-- Prerequisites: Database schema applied

-- Check primary key
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'wrong_queue'
  AND constraint_type = 'PRIMARY KEY';

-- Verify: Primary key exists on (user_id, root_id)

-- Check column defaults
SELECT 
    column_name,
    column_default
FROM information_schema.columns
WHERE table_name = 'wrong_queue'
  AND column_name IN ('queued_at', 'last_seen_at', 'times_incorrect')
ORDER BY column_name;

-- Verify: 
--   - queued_at has DEFAULT NOW()
--   - last_seen_at has DEFAULT NOW()
--   - times_incorrect has DEFAULT 1

-- ============================================
-- Test 14: RLS Policy Verification
-- ============================================
-- Expected: RLS policies enforce correct permissions
-- Prerequisites: Database schema and policies applied

-- Check RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('attempts', 'wrong_queue', 'themes', 'roots', 'theme_roots')
ORDER BY tablename;

-- Verify: rowsecurity = true for all tables

-- Check policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('attempts', 'wrong_queue')
ORDER BY tablename, policyname;

-- Verify: Policies exist for SELECT, INSERT, UPDATE, DELETE on wrong_queue
-- Verify: Policies exist for SELECT, INSERT on attempts

-- ============================================
-- Test Summary
-- ============================================
-- Run all tests above and verify:
-- [ ] rpc_get_review returns data for authenticated users
-- [ ] rpc_get_review returns empty for unauthenticated users
-- [ ] rpc_stats_overview returns correct stats
-- [ ] Streak calculation works for consecutive days
-- [ ] Streak calculation resets on gaps
-- [ ] rpc_submit_attempt creates attempts and updates wrong_queue
-- [ ] All required indexes exist
-- [ ] wrong_queue table has correct structure
-- [ ] RLS policies are enabled and correct

