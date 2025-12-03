# Rooty Security Documentation

## Overview

Rooty uses Supabase for authentication, database management, and API access. This document outlines the security approach, including authentication, Row-Level Security (RLS), role-based access control, and protected routes.

## Authentication Architecture

### Supabase Authentication

Rooty uses Supabase's built-in authentication system:

- **Provider**: Email/password authentication
- **Session Management**: Handled by Supabase client SDK
- **Token Storage**: Browser-based session storage
- **Auto-refresh**: Enabled for seamless user experience

### Authentication Flow

1. **Sign Up**
   - User provides email and password
   - Supabase creates auth user
   - Profile created with "learner" role by default
   - Session established automatically

2. **Sign In**
   - User provides email and password
   - Supabase validates credentials
   - Session token issued
   - User profile loaded

3. **Sign Out**
   - Session cleared
   - Tokens invalidated
   - User redirected to home

### AuthContext Implementation

The `AuthContext` (`src/context/AuthContext.tsx`) provides:
- Current user state
- User profile with role information
- Authentication methods (signIn, signUp, signOut)
- Role helpers (isAdmin, isLearner)

## Role-Based Access Control (RBAC)

### User Roles

**Learner** (default role):
- Can access all learner-facing pages
- Can create quiz attempts
- Can manage their own review queue
- Cannot access admin console
- Cannot modify roots or themes

**Admin**:
- All learner permissions
- Can access admin console (`/admin`)
- Can create, edit, and delete roots
- Can manage themes
- Can view all user data

### Role Assignment

- New users default to "learner" role
- Admin role assigned manually in Supabase dashboard
- Role stored in `profiles` table
- Role checked via `AuthContext.isAdmin` property

## Row-Level Security (RLS)

### Overview

All database tables have Row-Level Security enabled to enforce data access at the database level.

### RLS Policies

**Profiles Table**:
- Users can read their own profile
- Users can update their own profile
- Admins can read all profiles

**Themes Table**:
- Public read access (all users)
- Admin-only write access

**Roots Table**:
- Public read access (all users)
- Admin-only write access

**Attempts Table**:
- Users can create their own attempts
- Users can read their own attempts
- Admins can read all attempts

**Wrong Queue Table**:
- Users can manage their own queue entries
- Users can read their own queue entries
- Admins can read all queue entries

**Theme Roots Table**:
- Public read access
- Admin-only write access

### RLS Implementation

RLS policies are defined in `supabase/policies.sql` and enforce:
- User isolation (users only see their own data)
- Role-based permissions (admins have elevated access)
- Public data access (themes and roots readable by all)

## RPC Function Security

### Security Pattern

All RPC functions use `SECURITY DEFINER` with `SET search_path = public`:

```sql
CREATE OR REPLACE FUNCTION rpc_function_name(...)
RETURNS ...
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Function body
$$;
```

### Authentication Handling

RPC functions that require authentication use:

```sql
DECLARE
  user_id UUID := (SELECT auth.uid());
BEGIN
  IF user_id IS NULL THEN
    -- Return error or empty result
  END IF;
  -- Function logic
END;
```

This pattern:
- Prevents search_path attacks
- Safely retrieves authenticated user ID
- Handles unauthenticated requests gracefully

### RPC Functions

**Public Functions** (no auth required):
- `rpc_get_themes()` - Returns all themes
- `rpc_get_session()` - Returns random roots for quiz

**Authenticated Functions** (auth required):
- `rpc_submit_attempt()` - Records quiz attempt
- `rpc_get_review()` - Returns user's review queue
- `rpc_stats_overview()` - Returns user statistics

## Protected Routes

### Route Protection Levels

**Public Routes**:
- `/` - Home page
- `/auth` - Authentication page
- `/learn` - Theme selection (public data)

**Authenticated Routes** (require login):
- `/session` - Quiz session
- `/review` - Review queue
- `/profile` - User profile

**Admin Routes** (require admin role):
- `/admin` - Admin console

### Implementation

**PrivateRoute Component** (`src/components/PrivateRoute.tsx`):
- Checks for authenticated user
- Redirects to `/auth` if not authenticated
- Shows loading state during auth check

**ProtectedAdminRoute Component** (`src/components/ProtectedAdminRoute.tsx`):
- Checks for authenticated user
- Checks for admin role
- Redirects to `/auth` if not admin
- Shows loading state during auth check

### Route Guard Pattern

Routes are protected at the component level:

```tsx
<Route
  path="/session"
  element={
    <PrivateRoute>
      <Session />
    </PrivateRoute>
  }
/>
```

This ensures:
- Consistent protection across routes
- Clear separation of concerns
- Easy to maintain and update

## Environment Variables

### Public Variables (Client-Side)

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

These are safe to expose in client-side code as they're designed for public use.

### Private Variables (Server-Side Only)

- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (bypasses RLS)

**CRITICAL**: Never commit service role key to version control or expose it client-side.

### Environment Variable Management

- `.env.local` - Local development (gitignored)
- `env.example` - Template file (committed)
- Vercel environment variables - Production deployment

## Service Role Key Handling

### Usage

Service role key is used only for:
- Database seeding (`scripts/seed.mjs`)
- Administrative operations (if needed)

### Security Practices

1. **Never commit** service role key to git
2. **Never expose** in client-side code
3. **Use only** for server-side scripts
4. **Rotate** if accidentally exposed
5. **Store securely** in environment variables

## API Security

### Supabase Client

The Supabase client (`src/lib/supabase.ts`) is configured with:
- Auto-refresh tokens
- Persistent sessions
- URL session detection

### API Wrapper Functions

API wrapper functions (`src/lib/api.ts`) provide:
- Error handling
- Type safety
- Consistent error messages
- No direct database access (uses RPC functions)

## Security Best Practices

### Frontend

1. **Never store** sensitive data in localStorage
2. **Use HTTPS** in production
3. **Validate** user input
4. **Sanitize** displayed data
5. **Protect routes** at component level

### Backend

1. **Enable RLS** on all tables
2. **Use RPC functions** for data access
3. **Validate** user permissions
4. **Handle errors** gracefully
5. **Log** security events

### Database

1. **Use RLS policies** for access control
2. **Use SECURITY DEFINER** carefully
3. **Set search_path** in functions
4. **Validate** user IDs in functions
5. **Index** for performance

## Security Considerations

### Known Limitations

1. **Client-Side Validation**: Input validation happens client-side (can be bypassed)
2. **Role Assignment**: Admin role assigned manually (no self-service)
3. **Session Storage**: Sessions stored in browser (vulnerable to XSS)

### Mitigations

1. **Server-Side Validation**: RLS policies enforce server-side rules
2. **Role Verification**: Roles checked on every request
3. **Secure Storage**: Use httpOnly cookies if needed (future enhancement)

## Incident Response

### If Service Role Key Exposed

1. Immediately rotate key in Supabase dashboard
2. Update environment variables
3. Review access logs
4. Update documentation

### If User Data Breached

1. Notify affected users
2. Review RLS policies
3. Audit access logs
4. Update security measures

## Compliance

### Data Privacy

- User data isolated by RLS policies
- No sharing of user data between users
- Admin access logged (if implemented)

### GDPR Considerations

- User data can be deleted
- User can request data export
- Clear privacy policy needed (future)

## Future Enhancements

1. **Two-Factor Authentication** (2FA)
2. **Session Management** (view active sessions)
3. **Audit Logging** (track admin actions)
4. **Rate Limiting** (prevent abuse)
5. **CSRF Protection** (additional security layer)

---

*Security documentation for Rooty demo application*  
*Last updated: Debug branch implementation*  
*For questions, review Supabase documentation and RLS policies*

