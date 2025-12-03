# Deploy Word Roots Schema and RPC Functions

## Run Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `migrations/20250103000000_add_word_roots_schema_and_rpc.sql`
3. Paste and run in SQL Editor

## Verify

Run these queries to verify deployment:

### Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('word_roots', 'theme_word_roots')
ORDER BY table_name;
```

Should return 2 rows.

### Column Added
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'attempts' 
AND column_name = 'word_root_id';
```

Should return 1 row.

### RPC Function
```sql
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'rpc_get_word_session';
```

Should return function with arguments `(integer, integer)`.

### Test
```sql
SELECT * FROM rpc_get_word_session(NULL, 10);
```

Should return empty result (no error).

## Next Steps

1. Wait 10-30 seconds for PostgREST cache refresh
2. Run seed script: `npm run db:seed`
3. Restart dev server and test quiz

## Troubleshooting

**404 error persists**: Wait up to 60 seconds for cache refresh, or restart Supabase project.

**Constraint errors**: Verify `check_quiz_type` constraint exists and existing data doesn't violate it.

