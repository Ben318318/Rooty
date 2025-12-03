-- Fix RPC function security levels: change read-only functions to SECURITY INVOKER

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'rpc_get_themes'
  ) THEN
    CREATE OR REPLACE FUNCTION public.rpc_get_themes()
    RETURNS TABLE (
        id INTEGER,
        name TEXT,
        week_start DATE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE
    ) 
    LANGUAGE plpgsql
    SECURITY INVOKER
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

    GRANT EXECUTE ON FUNCTION public.rpc_get_themes() TO authenticated;
    REVOKE EXECUTE ON FUNCTION public.rpc_get_themes() FROM anon;
  END IF;
END;
$$;


DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'rpc_get_session'
  ) THEN
    CREATE OR REPLACE FUNCTION public.rpc_get_session(
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
    SECURITY INVOKER
    SET search_path = public
    AS $$
    BEGIN
        IF theme_id_param IS NULL THEN
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

    GRANT EXECUTE ON FUNCTION public.rpc_get_session(INTEGER, INTEGER) TO authenticated;
    REVOKE EXECUTE ON FUNCTION public.rpc_get_session(INTEGER, INTEGER) FROM anon;
  END IF;
END;
$$;


DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'rpc_get_review'
  ) THEN
    CREATE OR REPLACE FUNCTION public.rpc_get_review(
        limit_count INTEGER DEFAULT 10
    )
    RETURNS TABLE (
        id INTEGER,
        root_text TEXT,
        origin_lang TEXT,
        meaning TEXT,
        examples JSONB,
        source_title TEXT,
        source_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE,
        times_incorrect INTEGER,
        queued_at TIMESTAMP WITH TIME ZONE
    )
    LANGUAGE plpgsql
    SECURITY INVOKER
    SET search_path = public
    AS $$
    DECLARE
        user_id_val UUID;
    BEGIN
        user_id_val := (SELECT auth.uid());
        
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
            r.created_at,
            wq.times_incorrect,
            wq.queued_at
        FROM wrong_queue wq
        INNER JOIN roots r ON wq.root_id = r.id
        WHERE wq.user_id = user_id_val
        ORDER BY wq.times_incorrect DESC, wq.queued_at ASC
        LIMIT limit_count;
    END;
    $$;

    GRANT EXECUTE ON FUNCTION public.rpc_get_review(INTEGER) TO authenticated;
    REVOKE EXECUTE ON FUNCTION public.rpc_get_review(INTEGER) FROM anon;
  END IF;
END;
$$;


DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'rpc_stats_overview'
  ) THEN
    CREATE OR REPLACE FUNCTION public.rpc_stats_overview()
    RETURNS JSON
    LANGUAGE plpgsql
    SECURITY INVOKER
    SET search_path = public
    AS $$
    DECLARE
        user_id_val UUID;
        total_attempts INTEGER;
        correct_attempts INTEGER;
        accuracy_percent NUMERIC;
        roots_learned INTEGER;
        current_streak INTEGER;
    BEGIN
        user_id_val := (SELECT auth.uid());
        
        IF user_id_val IS NULL THEN
            RETURN json_build_object('success', false, 'error', 'User not authenticated');
        END IF;
        
        SELECT 
            COUNT(*),
            COUNT(*) FILTER (WHERE is_correct = true)
        INTO total_attempts, correct_attempts
        FROM attempts 
        WHERE user_id = user_id_val;
        
        IF total_attempts > 0 THEN
            accuracy_percent := ROUND((correct_attempts::NUMERIC / total_attempts::NUMERIC) * 100, 1);
        ELSE
            accuracy_percent := 0;
        END IF;
        
        SELECT COUNT(DISTINCT root_id)
        INTO roots_learned
        FROM attempts 
        WHERE user_id = user_id_val AND is_correct = true;
        
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

    GRANT EXECUTE ON FUNCTION public.rpc_stats_overview() TO authenticated;
    REVOKE EXECUTE ON FUNCTION public.rpc_stats_overview() FROM anon;
  END IF;
END;
$$;

-- ============================================================================
-- Function: rpc_submit_attempt()
-- Keep: SECURITY DEFINER (correct - needs to write data)
-- Add: GRANT/REVOKE statements
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'rpc_submit_attempt'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.rpc_submit_attempt(INTEGER, INTEGER, BOOLEAN, TEXT) TO authenticated;
    REVOKE EXECUTE ON FUNCTION public.rpc_submit_attempt(INTEGER, INTEGER, BOOLEAN, TEXT) FROM anon;
    
    -- Optional: Set owner to postgres for better security (commented out - uncomment if desired)
    -- ALTER FUNCTION public.rpc_submit_attempt(INTEGER, INTEGER, BOOLEAN, TEXT) OWNER TO postgres;
  END IF;
END;
$$;

-- Verification query:
-- SELECT 
--     p.proname as function_name,
--     CASE 
--         WHEN p.prosecdef THEN 'SECURITY DEFINER'
--         ELSE 'SECURITY INVOKER'
--     END as security_level
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
-- AND p.proname LIKE 'rpc_%'
-- ORDER BY p.proname;

