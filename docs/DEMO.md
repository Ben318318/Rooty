# Rooty Demo Walkthrough

This document provides a step-by-step guide for demonstrating the Rooty application to teachers and stakeholders.

## Prerequisites

1. **Database Setup:**
   - Ensure database is seeded with Christmas theme and 50 roots
   - Run: `npm run db:seed`
   - Verify Christmas theme exists in database

2. **Admin User:**
   - Sign up a user account via the app (creates learner by default)
   - In Supabase dashboard, update `profiles` table:
     ```sql
     UPDATE profiles SET role = 'admin' WHERE id = '<user-id>';
     ```
   - Document admin credentials securely (for demo only)

3. **Deployment:**
   - Ensure application is deployed to Vercel
   - Verify environment variables are configured:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

## Demo Flow

### 1. Login & Authentication
- **Show:** Login page with email/password authentication
- **Expected:** User successfully logs in and is redirected to Home page
- **Highlight:** Clean, simple authentication flow using Supabase

### 2. Home Page - Daily Challenges
- **Show:** Home page with 5 Daily Challenge cards
- **Expected:** 
  - 5 challenge cards displayed in grid layout
  - Each card shows "Challenge X of 5" with status badge
  - Cards are clickable (except completed ones)
- **Highlight:** Christmas-themed daily challenges feature

### 3. Complete Challenges
- **Show:** Click on Challenge 1 → Navigate to quiz session
- **Expected:**
  - Quiz session loads with 10 questions
  - Each question shows root word and asks for meaning
  - Score updates in real-time
  - After completing 10 questions, shows completion screen
  - Automatically marks challenge as complete
  - Returns to Home page
- **Repeat:** Complete Challenges 2-5
- **Highlight:** Smooth quiz flow, immediate feedback, challenge completion tracking

### 4. All Challenges Complete
- **Show:** After completing all 5 challenges
- **Expected:**
  - "Come back tomorrow" message appears
  - Celebration emoji and success message
  - Challenge cards show as completed (grayed out)
- **Highlight:** Daily challenge system with completion tracking

### 5. Review Mistakes
- **Show:** Navigate to Review page
- **Expected:**
  - Shows roots from wrong_queue (roots answered incorrectly)
  - Displays how many times each root was incorrect
  - Quiz interface for reviewing mistakes
  - Correct answers remove items from queue
- **Highlight:** Smart review system that tracks mistakes

### 6. Profile & Statistics
- **Show:** Navigate to Profile page
- **Expected:**
  - Displays user statistics:
    - Accuracy percentage
    - Roots learned count
    - Current streak
    - Total attempts / Correct answers
  - Progress bar showing accuracy
  - Quick action buttons
- **Highlight:** Comprehensive progress tracking

### 7. Learn Page
- **Show:** Navigate to Learn page
- **Expected:**
  - Shows available themes (including Christmas Special)
  - Theme cards with descriptions
  - Clicking theme starts quiz session
- **Highlight:** Theme-based learning organization

### 8. Admin Console (if time permits)
- **Show:** Login as admin → Navigate to `/admin`
- **Expected:**
  - Admin console accessible
  - Shows all 50 Christmas roots in table
  - Edit functionality works
  - Changes persist after save
  - Success/error messages appear
- **Highlight:** Admin can manage root dataset

## Key Features to Highlight

1. **Daily Challenges System:**
   - 5 challenges per day
   - Christmas-themed content
   - Completion tracking with localStorage
   - "Come back tomorrow" message

2. **Quiz Experience:**
   - Smooth question flow
   - Real-time score updates
   - Immediate feedback
   - Celebratory completion screen

3. **Review System:**
   - Tracks incorrect answers
   - Queue-based review
   - Mastery tracking

4. **Progress Tracking:**
   - Statistics dashboard
   - Streak calculation
   - Accuracy metrics
   - Roots learned count

5. **Admin Management:**
   - Full CRUD on roots
   - Christmas theme management
   - User data access

## Troubleshooting Tips

### Challenge Completion Not Persisting
- **Check:** Browser localStorage is enabled
- **Solution:** Clear localStorage and try again
- **Admin:** Use "Reset Challenges" button for demo

### Theme ID Not Found
- **Check:** Database has Christmas theme seeded
- **Solution:** Run `npm run db:seed` again
- **Verify:** Check Supabase dashboard for theme existence

### Admin Access Denied
- **Check:** User role is set to 'admin' in profiles table
- **Solution:** Update role in Supabase dashboard
- **Verify:** Check AuthContext for role detection

### Network Errors
- **Check:** Environment variables are set correctly
- **Solution:** Verify Supabase URL and keys
- **Verify:** Check network connection

### Empty Review Queue
- **Expected:** User has no incorrect answers yet
- **Solution:** Complete some challenges with wrong answers first
- **Show:** Empty state message is user-friendly

## Demo Best Practices

1. **Prepare Data:**
   - Have at least one admin user ready
   - Complete a few challenges before demo to show stats
   - Make some mistakes to populate review queue

2. **Test Flow First:**
   - Run through complete flow before demo
   - Verify all features work
   - Check responsive design on different screen sizes

3. **Have Backup Plan:**
   - Screenshots of key features
   - Video recording as backup
   - Local development server ready

4. **Focus on User Experience:**
   - Emphasize smooth interactions
   - Highlight Christmas theme
   - Show progress tracking value

5. **Time Management:**
   - Core flow: 5-7 minutes
   - Admin console: 2-3 minutes (if time)
   - Q&A: 3-5 minutes

---

*Created for Sprint 4: Final Integration, Polish & Deployment*

