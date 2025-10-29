/**
 * Supabase Client Configuration
 * Created by Gabriel
 * 
 * This module provides the configured Supabase client for use throughout the app.
 * Environment variables must be set in .env.local
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate credentials
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
    );
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Type definitions for database tables
export type UserRole = 'admin' | 'learner';

export interface Profile {
    id: string;
    role: UserRole;
    display_name: string | null;
    created_at: string;
    updated_at: string;
}

export interface Theme {
    id: number;
    name: string;
    week_start: string;
    description: string | null;
    created_at: string;
}

export interface Root {
    id: number;
    root_text: string;
    origin_lang: string;
    meaning: string;
    examples: string[];
    source_title: string;
    source_url: string;
    created_at: string;
}

export interface Attempt {
    id: number;
    user_id: string;
    root_id: number;
    theme_id: number | null;
    is_correct: boolean;
    user_answer: string | null;
    created_at: string;
}

export interface WrongQueueItem {
    user_id: string;
    root_id: number;
    queued_at: string;
    last_seen_at: string;
    times_incorrect: number;
}

// Database type helper
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
            };
            themes: {
                Row: Theme;
            };
            roots: {
                Row: Root;
            };
            attempts: {
                Row: Attempt;
            };
            wrong_queue: {
                Row: WrongQueueItem;
            };
        };
    };
}

