-- Rooty Database Indexes
-- Created by Nelson for Sprint 3: Database Fixes & RPC Alignment
--
-- This file contains indexes for optimal query performance.
-- Some indexes may already exist in schema.sql - these use IF NOT EXISTS to avoid conflicts.

-- Index on attempts.user_id (for filtering user attempts)
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);

-- Composite index on wrong_queue(user_id, root_id) for efficient lookups
-- Note: Primary key already provides unique constraint, but explicit index helps with queries
CREATE INDEX IF NOT EXISTS idx_wrong_queue_user_root ON wrong_queue(user_id, root_id);

-- Index on theme_roots.theme_id (for filtering roots by theme)
CREATE INDEX IF NOT EXISTS idx_theme_roots_theme_id ON theme_roots(theme_id);

-- Additional useful indexes (may already exist)
CREATE INDEX IF NOT EXISTS idx_attempts_root_id ON attempts(root_id);
CREATE INDEX IF NOT EXISTS idx_theme_roots_root_id ON theme_roots(root_id);
CREATE INDEX IF NOT EXISTS idx_wrong_queue_user_id ON wrong_queue(user_id);

