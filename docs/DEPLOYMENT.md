# Rooty Deployment Guide

This document provides step-by-step instructions for deploying the Rooty application to production.

## Prerequisites

- GitHub account with repository access
- Vercel account (free tier works)
- Supabase project set up
- Node.js 18+ installed locally

## Deployment Steps

### 1. Supabase Setup

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run Database Migrations:**
   - Apply schema: `supabase/schema.sql`
   - Apply policies: `supabase/policies.sql`
   - Apply RPC functions: `supabase/rpc.sql`
   - Apply indexes: `supabase/indexes.sql`

3. **Seed Database:**
   - Set up environment variables:
     ```bash
     cp env.example .env.local
     # Edit .env.local with your Supabase credentials
     ```
   - Run seed script:
     ```bash
     npm run db:seed
     ```
   - Verify Christmas theme and 50 roots are created

4. **Get Service Role Key:**
   - In Supabase dashboard → Settings → API
   - Copy service role key (keep secret!)
   - Needed for seed script in production

### 2. Vercel Deployment

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select Rooty project

2. **Configure Build Settings:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add the following:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```
   - **Important:** These are public variables (VITE_ prefix)

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Verify deployment URL works

### 3. Production Seed Script

**Option 1: Run Locally with Production Credentials**

1. Create `.env.production` file:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Run seed script:
   ```bash
   NODE_ENV=production node scripts/seed.mjs
   ```

**Option 2: Use Supabase SQL Editor**

1. Go to Supabase dashboard → SQL Editor
2. Run seed script manually or use Supabase CLI

**Option 3: Create Admin User**

1. Sign up via deployed app (creates learner)
2. In Supabase dashboard → Table Editor → profiles
3. Update role to 'admin' for your user

### 4. Verify Deployment

1. **Check Application:**
   - Visit deployed URL
   - Verify homepage loads
   - Test login/signup

2. **Test Features:**
   - Daily Challenges load
   - Quiz sessions work
   - Review page functions
   - Profile stats display
   - Admin console accessible (if admin user)

3. **Check Environment Variables:**
   - Verify Supabase connection works
   - Check browser console for errors
   - Verify API calls succeed

### 5. CI/CD Setup

GitHub Actions workflow (`.github/workflows/ci.yml`) will:
- Run on every push/PR
- Install dependencies
- Build project
- Type check (TypeScript)
- Verify no build errors

**Note:** Tests are optional (not configured yet)

## Environment Variables

### Required (Public)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Required (Local/Server Only)
- `SUPABASE_SERVICE_ROLE_KEY` - For seed script (never commit!)

## Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures React Router works correctly with client-side routing.

## Troubleshooting

### Build Fails
- **Check:** Node.js version (18+)
- **Check:** All dependencies installed
- **Check:** TypeScript errors
- **Solution:** Run `npm run build` locally first

### Environment Variables Not Working
- **Check:** Variables prefixed with `VITE_`
- **Check:** Variables set in Vercel dashboard
- **Check:** Redeploy after adding variables
- **Solution:** Restart deployment

### Database Connection Issues
- **Check:** Supabase URL is correct
- **Check:** Anon key is correct
- **Check:** RLS policies allow access
- **Solution:** Verify credentials in Supabase dashboard

### Routing Issues (404 on refresh)
- **Check:** `vercel.json` has rewrites
- **Check:** Output directory is `dist`
- **Solution:** Add rewrites to `vercel.json`

### Seed Script Fails
- **Check:** Service role key is correct
- **Check:** Database schema is applied
- **Check:** Network access to Supabase
- **Solution:** Run seed script locally with production credentials

## Production Checklist

- [ ] Supabase project created and configured
- [ ] Database schema applied
- [ ] RPC functions deployed
- [ ] Database seeded with Christmas theme
- [ ] Vercel project connected
- [ ] Environment variables set
- [ ] Build succeeds
- [ ] Application deployed
- [ ] All features tested
- [ ] Admin user created
- [ ] CI/CD pipeline working
- [ ] Documentation updated

## Rollback Procedure

If deployment fails:

1. **Vercel:**
   - Go to Deployments tab
   - Click on previous successful deployment
   - Click "Promote to Production"

2. **Database:**
   - Revert migrations if needed
   - Re-seed if data corrupted

3. **Code:**
   - Revert to previous git commit
   - Push and redeploy

## Monitoring

- **Vercel:** Check deployment logs and analytics
- **Supabase:** Monitor database usage and API calls
- **Browser:** Check console for client-side errors
- **Users:** Monitor for reported issues

## Security Notes

1. **Never commit:**
   - Service role keys
   - Production credentials
   - `.env.local` file

2. **Always use:**
   - RLS policies for data access
   - Environment variables for secrets
   - HTTPS in production

3. **Verify:**
   - Admin routes are protected
   - User data is isolated
   - API endpoints are secure

---

*Created for Sprint 4: Final Integration, Polish & Deployment*

