-- Supabase AI Recommended Fixes
-- Generated: 2024-12-20
-- Sprint 3: Database Fixes & RPC Alignment
--
-- This file contains SQL fixes recommended by Supabase AI for:
-- 1. Wrapping auth.uid() calls in (SELECT auth.uid()) for better security
-- 2. Fixing streak calculation using gap-and-island pattern
-- 3. Adding missing indexes
-- 4. Verifying wrong_queue table defaults
--
-- These fixes are applied in the respective files:
-- - supabase/rpc.sql (function updates)
-- - supabase/indexes.sql (index creation)
-- - supabase/schema.sql (table alterations)

-- Note: Actual implementation is in the respective SQL files.
-- This file serves as a reference for the changes made.

