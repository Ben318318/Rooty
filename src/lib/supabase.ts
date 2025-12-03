import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

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

export interface WordRoot {
    id: number;
    english_word: string;
    component_roots: string;
    correct_meaning: string;
    option_1: string;
    option_2: string;
    option_3: string;
    option_4: string;
    origin_lang: string;
    source_title: string | null;
    source_url: string | null;
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

