-- Rooty RPC Functions
-- Created by Nelson for the Rooty learning platform

-- Function to get all themes
CREATE OR REPLACE FUNCTION rpc_get_themes()
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    week_start DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.week_start,
        t.description,
        t.created_at
    FROM themes t
    ORDER BY t.week_start DESC;
END;
$$;

-- Function to get session roots (random selection from theme or all roots)
CREATE OR REPLACE FUNCTION rpc_get_session(
    theme_id_param INTEGER DEFAULT NULL,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id INTEGER,
    root_text TEXT,
    origin_lang TEXT,
    meaning TEXT,
    examples JSONB,
    source_title TEXT,
    source_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF theme_id_param IS NULL THEN
        -- Get random roots from all roots
        RETURN QUERY
        SELECT 
            r.id,
            r.root_text,
            r.origin_lang,
            r.meaning,
            r.examples,
            r.source_title,
            r.source_url
        FROM roots r
        ORDER BY RANDOM()
        LIMIT limit_count;
    ELSE
        -- Get random roots from specific theme
        RETURN QUERY
        SELECT 
            r.id,
            r.root_text,
            r.origin_lang,
            r.meaning,
            r.examples,
            r.source_title,
            r.source_url
        FROM roots r
        INNER JOIN theme_roots tr ON r.id = tr.root_id
        WHERE tr.theme_id = theme_id_param
        ORDER BY RANDOM()
        LIMIT limit_count;
    END IF;
END;
$$;

-- Function to submit an attempt and update wrong queue
CREATE OR REPLACE FUNCTION rpc_submit_attempt(
    root_id_param INTEGER,
    theme_id_param INTEGER DEFAULT NULL,
    is_correct_param BOOLEAN,
    user_answer_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id_val UUID;
    attempt_id INTEGER;
    result JSON;
BEGIN
    -- Get current user ID (wrapped for security)
    user_id_val := (SELECT auth.uid());
    
    IF user_id_val IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not authenticated');
    END IF;
    
    -- Insert attempt
    INSERT INTO attempts (user_id, root_id, theme_id, is_correct, user_answer)
    VALUES (user_id_val, root_id_param, theme_id_param, is_correct_param, user_answer_param)
    RETURNING id INTO attempt_id;
    
    -- Update wrong queue based on correctness
    IF is_correct_param = false THEN
        -- Add or update wrong queue entry
        INSERT INTO wrong_queue (user_id, root_id, times_incorrect)
        VALUES (user_id_val, root_id_param, 1)
        ON CONFLICT (user_id, root_id) 
        DO UPDATE SET 
            times_incorrect = wrong_queue.times_incorrect + 1,
            last_seen_at = NOW();
    ELSE
        -- Remove from wrong queue if correct
        DELETE FROM wrong_queue 
        WHERE user_id = user_id_val AND root_id = root_id_param;
    END IF;
    
    -- Return success response
    RETURN json_build_object(
        'success', true, 
        'attempt_id', attempt_id,
        'message', CASE 
            WHEN is_correct_param THEN 'Correct! Removed from review queue.'
            ELSE 'Incorrect. Added to review queue.'
        END
    );
END;
$$;

-- Function to get review items (wrong queue)
CREATE OR REPLACE FUNCTION rpc_get_review(
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    root_id INTEGER,
    root_text TEXT,
    origin_lang TEXT,
    meaning TEXT,
    examples JSONB,
    source_title TEXT,
    source_url TEXT,
    times_incorrect INTEGER,
    queued_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id_val UUID;
BEGIN
    -- Get current user ID (wrapped for security)
    user_id_val := (SELECT auth.uid());
    
    -- Return empty set if unauthenticated
    IF user_id_val IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        r.id,
        r.root_text,
        r.origin_lang,
        r.meaning,
        r.examples,
        r.source_title,
        r.source_url,
        wq.times_incorrect,
        wq.queued_at
    FROM wrong_queue wq
    INNER JOIN roots r ON wq.root_id = r.id
    WHERE wq.user_id = user_id_val
    ORDER BY wq.times_incorrect DESC, wq.queued_at ASC
    LIMIT limit_count;
END;
$$;

-- Function to get user stats overview
CREATE OR REPLACE FUNCTION rpc_stats_overview()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id_val UUID;
    total_attempts INTEGER;
    correct_attempts INTEGER;
    accuracy_percent NUMERIC;
    roots_learned INTEGER;
    current_streak INTEGER;
    result JSON;
BEGIN
    -- Get current user ID (wrapped for security)
    user_id_val := (SELECT auth.uid());
    
    IF user_id_val IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not authenticated');
    END IF;
    
    -- Get basic stats
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE is_correct = true)
    INTO total_attempts, correct_attempts
    FROM attempts 
    WHERE user_id = user_id_val;
    
    -- Calculate accuracy
    IF total_attempts > 0 THEN
        accuracy_percent := ROUND((correct_attempts::NUMERIC / total_attempts::NUMERIC) * 100, 1);
    ELSE
        accuracy_percent := 0;
    END IF;
    
    -- Count unique roots learned (correctly answered)
    SELECT COUNT(DISTINCT root_id)
    INTO roots_learned
    FROM attempts 
    WHERE user_id = user_id_val AND is_correct = true;
    
    -- Calculate current streak using gap-and-island pattern
    -- Streak = consecutive calendar days where user has at least one attempt
    WITH daily_attempts AS (
        SELECT DISTINCT DATE(created_at) as attempt_date
        FROM attempts
        WHERE user_id = user_id_val
        ORDER BY attempt_date DESC
    ),
    streak_groups AS (
        SELECT 
            attempt_date,
            ROW_NUMBER() OVER (ORDER BY attempt_date DESC) as rn,
            attempt_date - (ROW_NUMBER() OVER (ORDER BY attempt_date DESC) || ' days')::INTERVAL as grp
        FROM daily_attempts
    )
    SELECT COALESCE(COUNT(*), 0)
    INTO current_streak
    FROM streak_groups
    WHERE grp = (SELECT grp FROM streak_groups ORDER BY attempt_date DESC LIMIT 1);
    
    -- If no attempts exist, streak is 0
    IF current_streak IS NULL THEN
        current_streak := 0;
    END IF;
    
    -- Build result
    RETURN json_build_object(
        'success', true,
        'total_attempts', total_attempts,
        'correct_attempts', correct_attempts,
        'accuracy_percent', accuracy_percent,
        'roots_learned', roots_learned,
        'current_streak', COALESCE(current_streak, 0)
    );
END;
$$;
