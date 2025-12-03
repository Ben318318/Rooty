-- Add admin RLS policies for attempts and wrong_queue tables

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' 
    AND tablename = 'attempts' 
    AND policyname = 'attempts_admin_manage'
  ) THEN
    CREATE POLICY attempts_admin_manage ON public.attempts
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p 
          WHERE p.id = (SELECT auth.uid()) 
          AND p.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p 
          WHERE p.id = (SELECT auth.uid()) 
          AND p.role = 'admin'
        )
      );
    
    COMMENT ON POLICY attempts_admin_manage ON public.attempts IS 
      'Allows admins to manage all attempts for analytics and administration';
  END IF;
END;
$$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' 
    AND tablename = 'wrong_queue' 
    AND policyname = 'wrong_queue_admin_manage'
  ) THEN
    CREATE POLICY wrong_queue_admin_manage ON public.wrong_queue
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p 
          WHERE p.id = (SELECT auth.uid()) 
          AND p.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p 
          WHERE p.id = (SELECT auth.uid()) 
          AND p.role = 'admin'
        )
      );
    
  END IF;
END;
$$;

-- Verification:
-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename IN ('attempts', 'wrong_queue')
-- AND policyname LIKE '%admin%'
-- ORDER BY tablename, policyname;

