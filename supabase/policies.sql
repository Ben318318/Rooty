-- Rooty Row-Level Security Policies
-- Created by Nelson for the Rooty learning platform

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE roots ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_roots ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_queue ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- System can insert profiles (handled by trigger)
CREATE POLICY "System can insert profiles" ON profiles
    FOR INSERT WITH CHECK (true);

-- Themes policies
-- Everyone can read themes
CREATE POLICY "Anyone can read themes" ON themes
    FOR SELECT USING (true);

-- Only admins can modify themes
CREATE POLICY "Admins can insert themes" ON themes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update themes" ON themes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete themes" ON themes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Roots policies
-- Everyone can read roots
CREATE POLICY "Anyone can read roots" ON roots
    FOR SELECT USING (true);

-- Only admins can modify roots
CREATE POLICY "Admins can insert roots" ON roots
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update roots" ON roots
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete roots" ON roots
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Theme-Roots policies
-- Everyone can read theme-roots relationships
CREATE POLICY "Anyone can read theme_roots" ON theme_roots
    FOR SELECT USING (true);

-- Only admins can modify theme-roots relationships
CREATE POLICY "Admins can insert theme_roots" ON theme_roots
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete theme_roots" ON theme_roots
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Attempts policies
-- Users can view their own attempts
CREATE POLICY "Users can view own attempts" ON attempts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own attempts
CREATE POLICY "Users can insert own attempts" ON attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wrong queue policies
-- Users can view their own wrong queue
CREATE POLICY "Users can view own wrong_queue" ON wrong_queue
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own wrong queue entries
CREATE POLICY "Users can insert own wrong_queue" ON wrong_queue
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own wrong queue entries
CREATE POLICY "Users can update own wrong_queue" ON wrong_queue
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own wrong queue entries
CREATE POLICY "Users can delete own wrong_queue" ON wrong_queue
    FOR DELETE USING (auth.uid() = user_id);
