/**
 * API Layer
 * Created by Nick
 *
 * Wrapper functions for all Supabase RPC calls.
 * Provides clean abstraction for frontend components.
 */

import { supabase } from "./supabase";
import type { Theme, Root } from "./supabase";

// Response types for RPC functions
export interface SessionRoot extends Root {
  // Same as Root but from session context
}

export interface ReviewRoot extends Root {
  times_incorrect: number;
  queued_at: string;
}

export interface StatsResponse {
  success: boolean;
  total_attempts: number;
  correct_attempts: number;
  accuracy_percent: number;
  roots_learned: number;
  current_streak: number;
}

export interface SubmitAttemptResponse {
  success: boolean;
  attempt_id?: number;
  message?: string;
  error?: string;
}

/**
 * Get all available themes
 */
export async function getThemes(): Promise<{
  data: Theme[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.rpc("rpc_get_themes");

    if (error) {
      return { data: null, error };
    }

    return { data: data as Theme[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Get session roots for quiz
 * @param themeId - Optional theme ID to filter by. If null, returns random roots from all roots
 * @param limit - Number of roots to return (default: 10)
 */
export async function getSession(
  themeId?: number | null,
  limit: number = 10
): Promise<{ data: SessionRoot[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_get_session", {
      theme_id_param: themeId ?? null,
      limit_count: limit,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data as SessionRoot[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Submit a quiz attempt
 * @param rootId - ID of the root being answered
 * @param isCorrect - Whether the answer was correct
 * @param userAnswer - The user's submitted answer
 * @param themeId - Optional theme ID if quiz is from a specific theme
 */
export async function submitAttempt(
  rootId: number,
  isCorrect: boolean,
  userAnswer: string,
  themeId?: number | null
): Promise<{ data: SubmitAttemptResponse | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_submit_attempt", {
      root_id_param: rootId,
      theme_id_param: themeId ?? null,
      is_correct_param: isCorrect,
      user_answer_param: userAnswer,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data as SubmitAttemptResponse, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Get review items from wrong queue
 * @param limit - Number of items to return (default: 10)
 */
export async function getReview(
  limit: number = 10
): Promise<{ data: ReviewRoot[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_get_review", {
      limit_count: limit,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data as ReviewRoot[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Get user statistics overview
 */
export async function getStatsOverview(): Promise<{
  data: StatsResponse | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.rpc("rpc_stats_overview");

    if (error) {
      return { data: null, error };
    }

    return { data: data as StatsResponse, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}
