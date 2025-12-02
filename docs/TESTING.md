# Rooty Testing Guide

This document provides comprehensive testing instructions for verifying that all Sprint 4 features work correctly.

## Testing Checklist

Use this checklist to verify all features are working:

- [ ] Complete learner journey end-to-end
- [ ] Complete admin journey end-to-end
- [ ] Test error cases (unauthorized, network errors, etc.)
- [ ] Verify responsive design on mobile/tablet
- [ ] Check all pages for styling consistency
- [ ] Run CI pipeline → verify passes
- [ ] Deploy to Vercel → verify works
- [ ] Run seed script in production → verify works
- [ ] Create admin user → verify admin access works
- [ ] Review all documentation → verify accurate

## Manual Testing Steps

### 1. Learner Flow Testing

**Test Flow: Complete Learner Journey**

1. **Sign Up:**
   - Navigate to `/auth`
   - Click "Sign Up"
   - Enter email and password
   - Submit form
   - **Expected:** User created, redirected to Home, profile has "learner" role

2. **Login:**
   - Sign out
   - Navigate to `/auth`
   - Click "Sign In"
   - Enter credentials
   - **Expected:** Successfully logged in, redirected to Home

3. **View Daily Challenges:**
   - On Home page, scroll to Daily Challenges section
   - **Expected:** 
     - 5 challenge cards displayed
     - Each shows "Challenge X of 5"
     - Status badges show "Not started"
     - Cards are clickable

4. **Complete Challenge 1:**
   - Click Challenge 1 card
   - **Expected:** Navigate to `/session?theme=<id>&challenge=1`
   - Complete 10 questions
   - **Expected:**
     - Quiz loads with 10 roots
     - Score updates after each answer
     - Completion screen shows after 10th question
     - Challenge marked as complete
     - Auto-navigate to Home after 2 seconds

5. **Complete Challenges 2-5:**
   - Repeat step 4 for challenges 2-5
   - **Expected:** All challenges mark as complete

6. **Verify "Come Back Tomorrow" Message:**
   - After completing all 5 challenges
   - **Expected:**
     - Success card appears
     - Message: "You've finished today's 5 challenges!"
     - "Come back tomorrow" text visible
     - Challenge cards show as completed (grayed out)

7. **Navigate to Review:**
   - Click "Review Mistakes" or navigate to `/review`
   - **Expected:**
     - Shows roots from wrong_queue
     - Displays times_incorrect count
     - Quiz interface for reviewing
     - Empty state if no mistakes

8. **Navigate to Profile:**
   - Click "View Profile" or navigate to `/profile`
   - **Expected:**
     - Stats display correctly:
       - Total attempts
       - Accuracy percentage
       - Roots learned
       - Current streak
     - Progress bar shows accuracy
     - Quick action buttons work

9. **Navigate to Learn:**
   - Click "Start Learning" or navigate to `/learn`
   - **Expected:**
     - Shows available themes
     - Christmas Special theme visible
     - Theme cards are clickable

### 2. Admin Flow Testing

**Test Flow: Complete Admin Journey**

1. **Login as Admin:**
   - Sign in with admin account
   - **Expected:** Admin role detected, admin buttons visible

2. **Navigate to Admin Console:**
   - Click "Admin Console" or navigate to `/admin`
   - **Expected:** 
     - Admin page loads
     - Shows Christmas theme info
     - Displays all 50 roots in table

3. **Edit a Root:**
   - Click "Edit" on any root
   - **Expected:** 
     - Fields become editable
     - Save/Cancel buttons appear
   - Modify a field (e.g., meaning)
   - Click "Save"
   - **Expected:**
     - Success message appears
     - Changes persist after page refresh
     - Root data updated in database

4. **Navigate to Home:**
   - Click "Home" or navigate to `/`
   - **Expected:** Daily Challenges work normally

5. **Complete a Challenge as Admin:**
   - Complete Challenge 1 (if not already done)
   - **Expected:** Works same as learner, challenge marks complete

### 3. Error Cases Testing

**Test Flow: Error Handling**

1. **Unauthenticated Access:**
   - Sign out
   - Try navigating to `/profile`
   - **Expected:** Redirects to `/auth`
   - Try navigating to `/review`
   - **Expected:** Redirects to `/auth`
   - Try navigating to `/session`
   - **Expected:** Redirects to `/auth`

2. **Non-Admin Access to Admin:**
   - Sign in as learner (non-admin)
   - Try navigating to `/admin`
   - **Expected:** Redirects to `/auth` or shows access denied

3. **Session with No Roots:**
   - Navigate to `/session?theme=999` (non-existent theme)
   - **Expected:** 
     - Error message appears
     - User-friendly error: "No roots available for this session..."
     - Back button or navigation option available

4. **Network Errors:**
   - Disconnect network
   - Try loading any page that fetches data
   - **Expected:**
     - Error message appears
     - User-friendly message about network issues
     - Retry option available

### 4. Responsive Design Testing

**Test Flow: Responsive Layout**

1. **Mobile (375px width):**
   - Open browser DevTools
   - Set viewport to 375px width
   - Test all pages:
     - Home
     - Learn
     - Session
     - Review
     - Profile
     - Admin
   - **Expected:**
     - Layout adapts to mobile
     - Text is readable
     - Buttons are tappable
     - No horizontal scrolling

2. **Tablet (768px width):**
   - Set viewport to 768px width
   - Test all pages
   - **Expected:**
     - Grid layouts adapt
     - Cards stack appropriately
     - Navigation works

3. **Desktop (1024px+ width):**
   - Set viewport to 1024px+ width
   - Test all pages
   - **Expected:**
     - Full layout displayed
     - Grids show multiple columns
     - Optimal use of space

### 5. CI/CD Testing

**Test Flow: Continuous Integration**

1. **Push to Branch:**
   - Make a commit
   - Push to GitHub
   - **Expected:** GitHub Actions workflow runs

2. **Verify Build:**
   - Check Actions tab in GitHub
   - **Expected:**
     - Workflow completes successfully
     - Build succeeds
     - No TypeScript errors
     - No build errors

3. **Verify Linting:**
   - Check workflow output
   - **Expected:** No linting errors (if ESLint configured)

### 6. Deployment Testing

**Test Flow: Vercel Deployment**

1. **Deploy Preview:**
   - Create PR or push to branch
   - **Expected:** Vercel creates preview deployment

2. **Test Preview:**
   - Visit preview URL
   - **Expected:**
     - Application loads
     - All features work
     - Environment variables set correctly

3. **Production Deployment:**
   - Merge to main/master
   - **Expected:** Production deployment succeeds

4. **Test Production:**
   - Visit production URL
   - **Expected:**
     - Application works correctly
     - All features functional
     - No console errors

### 7. Seed Script Testing

**Test Flow: Production Seeding**

1. **Run Seed Script:**
   - Use production Supabase credentials
   - Run: `npm run db:seed`
   - **Expected:**
     - Script runs without errors
     - Christmas theme created
     - 50 roots inserted
     - Theme-root relationships created

2. **Verify Data:**
   - Check Supabase dashboard
   - **Expected:**
     - Christmas theme exists
     - 50 roots in database
     - theme_roots table has relationships

### 8. Admin User Creation Testing

**Test Flow: Admin User Setup**

1. **Sign Up User:**
   - Create new user via app
   - **Expected:** User created with "learner" role

2. **Update to Admin:**
   - In Supabase dashboard → profiles table
   - Update role to 'admin'
   - **Expected:** Role updated successfully

3. **Verify Admin Access:**
   - Sign in as updated user
   - Navigate to `/admin`
   - **Expected:** Admin console accessible

## Common Issues & Solutions

### Challenge Completion Not Persisting
- **Issue:** Challenges don't stay completed after refresh
- **Check:** Browser localStorage enabled
- **Solution:** Clear localStorage and try again
- **Admin Fix:** Use "Reset Challenges" button

### Theme ID Not Found
- **Issue:** Error loading Christmas theme
- **Check:** Database has Christmas theme
- **Solution:** Run `npm run db:seed`
- **Verify:** Check Supabase dashboard

### Admin Access Denied
- **Issue:** Cannot access `/admin` route
- **Check:** User role is 'admin' in profiles table
- **Solution:** Update role in Supabase dashboard
- **Verify:** Check AuthContext role detection

### Network Errors
- **Issue:** API calls fail
- **Check:** Environment variables set correctly
- **Solution:** Verify Supabase URL and keys
- **Verify:** Check network connection

### Empty Review Queue
- **Issue:** Review page shows empty
- **Expected:** User has no incorrect answers
- **Solution:** Complete challenges with wrong answers first
- **Verify:** Empty state message is user-friendly

## Testing Best Practices

1. **Test in Order:**
   - Start with learner flow
   - Then admin flow
   - Finally error cases

2. **Use Fresh Data:**
   - Clear localStorage between tests
   - Use test accounts
   - Reset challenges if needed

3. **Document Issues:**
   - Note any bugs found
   - Screenshot errors
   - Record steps to reproduce

4. **Verify Across Browsers:**
   - Chrome
   - Firefox
   - Safari (if available)
   - Edge

5. **Test Performance:**
   - Check page load times
   - Verify smooth animations
   - Check for memory leaks

## Acceptance Criteria

All tests pass when:
- ✅ Complete learner journey works end-to-end
- ✅ Complete admin journey works end-to-end
- ✅ Error cases handled gracefully
- ✅ Responsive design works on all devices
- ✅ CI pipeline passes
- ✅ Deployment works correctly
- ✅ Seed script works in production
- ✅ Admin user can access admin console
- ✅ Documentation is accurate

---

*Created for Sprint 4: Final Integration, Polish & Deployment*

