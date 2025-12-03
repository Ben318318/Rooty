-- Add word roots schema and RPC functions for English word-based quiz format

CREATE TABLE IF NOT EXISTS word_roots (
    id SERIAL PRIMARY KEY,
    english_word TEXT NOT NULL UNIQUE,
    component_roots TEXT NOT NULL,
    correct_meaning TEXT NOT NULL,
    option_1 TEXT NOT NULL,
    option_2 TEXT NOT NULL,
    option_3 TEXT NOT NULL,
    option_4 TEXT NOT NULL,
    origin_lang TEXT NOT NULL,
    source_title TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS theme_word_roots (
    theme_id INTEGER REFERENCES themes(id) ON DELETE CASCADE,
    word_root_id INTEGER REFERENCES word_roots(id) ON DELETE CASCADE,
    PRIMARY KEY (theme_id, word_root_id)
);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'attempts' 
        AND column_name = 'word_root_id'
    ) THEN
        ALTER TABLE attempts ADD COLUMN word_root_id INTEGER REFERENCES word_roots(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_quiz_type'
    ) THEN
        ALTER TABLE attempts ALTER COLUMN root_id DROP NOT NULL;
        ALTER TABLE attempts ADD CONSTRAINT check_quiz_type CHECK (
            (root_id IS NOT NULL AND word_root_id IS NULL) OR 
            (root_id IS NULL AND word_root_id IS NOT NULL)
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attempts_word_root_id ON attempts(word_root_id);
CREATE INDEX IF NOT EXISTS idx_theme_word_roots_theme_id ON theme_word_roots(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_word_roots_word_root_id ON theme_word_roots(word_root_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_word_roots_updated_at'
    ) THEN
        CREATE TRIGGER update_word_roots_updated_at 
        BEFORE UPDATE ON word_roots 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

CREATE OR REPLACE FUNCTION rpc_get_word_session(
    theme_id_param INTEGER DEFAULT NULL,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id INTEGER,
    english_word TEXT,
    component_roots TEXT,
    correct_meaning TEXT,
    option_1 TEXT,
    option_2 TEXT,
    option_3 TEXT,
    option_4 TEXT,
    origin_lang TEXT,
    source_title TEXT,
    source_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF theme_id_param IS NULL THEN
        RETURN QUERY
        SELECT 
            wr.id,
            wr.english_word,
            wr.component_roots,
            wr.correct_meaning,
            wr.option_1,
            wr.option_2,
            wr.option_3,
            wr.option_4,
            wr.origin_lang,
            wr.source_title,
            wr.source_url
        FROM word_roots wr
        ORDER BY RANDOM()
        LIMIT limit_count;
    ELSE
        RETURN QUERY
        SELECT 
            wr.id,
            wr.english_word,
            wr.component_roots,
            wr.correct_meaning,
            wr.option_1,
            wr.option_2,
            wr.option_3,
            wr.option_4,
            wr.origin_lang,
            wr.source_title,
            wr.source_url
        FROM word_roots wr
        INNER JOIN theme_word_roots twr ON wr.id = twr.word_root_id
        WHERE twr.theme_id = theme_id_param
        ORDER BY RANDOM()
        LIMIT limit_count;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION rpc_submit_attempt(
    root_id_param INTEGER DEFAULT NULL,
    word_root_id_param INTEGER DEFAULT NULL,
    theme_id_param INTEGER DEFAULT NULL,
    is_correct_param BOOLEAN DEFAULT NULL,
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
    user_id_val := (SELECT auth.uid());
    
    IF user_id_val IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not authenticated');
    END IF;
    
    IF is_correct_param IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'is_correct_param is required');
    END IF;
    
    IF (root_id_param IS NULL AND word_root_id_param IS NULL) OR 
       (root_id_param IS NOT NULL AND word_root_id_param IS NOT NULL) THEN
        RETURN json_build_object('success', false, 'error', 'Must provide exactly one of root_id or word_root_id');
    END IF;
    
    INSERT INTO attempts (user_id, root_id, word_root_id, theme_id, is_correct, user_answer)
    VALUES (user_id_val, root_id_param, word_root_id_param, theme_id_param, is_correct_param, user_answer_param)
    RETURNING id INTO attempt_id;
    
    IF root_id_param IS NOT NULL THEN
        IF is_correct_param = false THEN
            INSERT INTO wrong_queue (user_id, root_id, times_incorrect)
            VALUES (user_id_val, root_id_param, 1)
            ON CONFLICT (user_id, root_id) 
            DO UPDATE SET 
                times_incorrect = wrong_queue.times_incorrect + 1,
                last_seen_at = NOW();
        ELSE
            DELETE FROM wrong_queue 
            WHERE user_id = user_id_val AND root_id = root_id_param;
        END IF;
    END IF;
    
    RETURN json_build_object(
        'success', true, 
        'attempt_id', attempt_id,
        'message', CASE 
            WHEN is_correct_param THEN 'Correct!'
            ELSE 'Incorrect.'
        END
    );
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_get_word_session(INTEGER, INTEGER) TO authenticated;
REVOKE EXECUTE ON FUNCTION rpc_get_word_session(INTEGER, INTEGER) FROM anon;

GRANT EXECUTE ON FUNCTION rpc_submit_attempt(INTEGER, INTEGER, INTEGER, BOOLEAN, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION rpc_submit_attempt(INTEGER, INTEGER, INTEGER, BOOLEAN, TEXT) FROM anon;

-- Verification:

-- 1. Verify tables exist:
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('word_roots', 'theme_word_roots')
-- ORDER BY table_name;

-- 2. Verify word_root_id column exists in attempts:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'attempts' 
-- AND column_name = 'word_root_id';

-- 3. Verify RPC function exists:
-- SELECT 
--     p.proname as function_name,
--     pg_get_function_identity_arguments(p.oid) as arguments
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
-- AND p.proname = 'rpc_get_word_session';

-- 4. Test the function (will return empty if no data seeded yet):
-- SELECT * FROM rpc_get_word_session(NULL, 10);

