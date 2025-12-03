-- Rooty Database Schema
-- Created by Nelson for the Rooty learning platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'learner');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role NOT NULL DEFAULT 'learner',
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Themes table (weekly learning themes)
CREATE TABLE themes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    week_start DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roots table (the core learning content)
CREATE TABLE roots (
    id SERIAL PRIMARY KEY,
    root_text TEXT NOT NULL UNIQUE,
    origin_lang TEXT NOT NULL,
    meaning TEXT NOT NULL,
    examples JSONB NOT NULL DEFAULT '[]',
    source_title TEXT NOT NULL,
    source_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Theme-Roots junction table
CREATE TABLE theme_roots (
    theme_id INTEGER REFERENCES themes(id) ON DELETE CASCADE,
    root_id INTEGER REFERENCES roots(id) ON DELETE CASCADE,
    PRIMARY KEY (theme_id, root_id)
);

-- Word Roots table (English words with component roots and multiple choice options)
CREATE TABLE word_roots (
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

-- Theme-Word Roots junction table
CREATE TABLE theme_word_roots (
    theme_id INTEGER REFERENCES themes(id) ON DELETE CASCADE,
    word_root_id INTEGER REFERENCES word_roots(id) ON DELETE CASCADE,
    PRIMARY KEY (theme_id, word_root_id)
);

-- Attempts table (quiz history)
CREATE TABLE attempts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    root_id INTEGER REFERENCES roots(id) ON DELETE CASCADE,
    word_root_id INTEGER REFERENCES word_roots(id) ON DELETE CASCADE,
    theme_id INTEGER REFERENCES themes(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    user_answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_quiz_type CHECK (
        (root_id IS NOT NULL AND word_root_id IS NULL) OR 
        (root_id IS NULL AND word_root_id IS NOT NULL)
    )
);

-- Wrong queue table (mistakes to review)
CREATE TABLE wrong_queue (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    root_id INTEGER REFERENCES roots(id) ON DELETE CASCADE,
    queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    times_incorrect INTEGER DEFAULT 1,
    PRIMARY KEY (user_id, root_id)
);

-- Create indexes for better performance
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_root_id ON attempts(root_id);
CREATE INDEX idx_attempts_word_root_id ON attempts(word_root_id);
CREATE INDEX idx_wrong_queue_user_id ON wrong_queue(user_id);
CREATE INDEX idx_theme_roots_theme_id ON theme_roots(theme_id);
CREATE INDEX idx_theme_roots_root_id ON theme_roots(root_id);
CREATE INDEX idx_theme_word_roots_theme_id ON theme_word_roots(theme_id);
CREATE INDEX idx_theme_word_roots_word_root_id ON theme_word_roots(word_root_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roots_updated_at BEFORE UPDATE ON roots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_word_roots_updated_at BEFORE UPDATE ON word_roots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
