-- Ensure Christmas Special theme exists

INSERT INTO public.themes (name, week_start, description, created_at, updated_at)
SELECT 
    'Christmas Special',
    CURRENT_DATE,
    'Learn Latin and Greek roots related to Christmas, winter, and celebration.',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.themes WHERE name = 'Christmas Special'
);

-- Verification:
-- SELECT id, name, week_start, description 
-- FROM themes 
-- WHERE name = 'Christmas Special';

