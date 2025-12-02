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
      console.error("Error fetching themes:", error);
      const friendlyError = new Error(
        error.message || "Failed to load themes. Please try again later."
      );
      return { data: null, error: friendlyError };
    }

    if (!data) {
      return { data: [], error: null };
    }

    return { data: data as Theme[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching themes:", err);
    const friendlyError = new Error(
      err instanceof Error
        ? err.message
        : "Network error. Please check your connection and try again."
    );
    return { data: null, error: friendlyError };
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
      console.error("Error fetching session roots:", error);
      const friendlyError = new Error(
        error.message || "Failed to load quiz session. Please try again."
      );
      return { data: null, error: friendlyError };
    }

    if (!data || data.length === 0) {
      return {
        data: [],
        error: new Error("No roots available for this session."),
      };
    }

    return { data: data as SessionRoot[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching session:", err);
    const friendlyError = new Error(
      err instanceof Error
        ? err.message
        : "Network error. Please check your connection and try again."
    );
    return { data: null, error: friendlyError };
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
      console.error("Error submitting attempt:", error);
      const friendlyError = new Error(
        error.message || "Failed to save your answer. Please try again."
      );
      return { data: null, error: friendlyError };
    }

    if (!data) {
      return {
        data: null,
        error: new Error("No response from server. Please try again."),
      };
    }

    return { data: data as SubmitAttemptResponse, error: null };
  } catch (err) {
    console.error("Unexpected error submitting attempt:", err);
    const friendlyError = new Error(
      err instanceof Error
        ? err.message
        : "Network error. Please check your connection and try again."
    );
    return { data: null, error: friendlyError };
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
      console.error("Error fetching review queue:", error);
      const friendlyError = new Error(
        error.message || "Failed to load review queue. Please try again."
      );
      return { data: null, error: friendlyError };
    }

    // Empty array is valid - user has no items to review
    return { data: (data as ReviewRoot[]) || [], error: null };
  } catch (err) {
    console.error("Unexpected error fetching review:", err);
    const friendlyError = new Error(
      err instanceof Error
        ? err.message
        : "Network error. Please check your connection and try again."
    );
    return { data: null, error: friendlyError };
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
      console.error("Error fetching stats:", error);
      const friendlyError = new Error(
        error.message || "Failed to load statistics. Please try again."
      );
      return { data: null, error: friendlyError };
    }

    if (!data) {
      return {
        data: null,
        error: new Error("No statistics data available."),
      };
    }

    return { data: data as StatsResponse, error: null };
  } catch (err) {
    console.error("Unexpected error fetching stats:", err);
    const friendlyError = new Error(
      err instanceof Error
        ? err.message
        : "Network error. Please check your connection and try again."
    );
    return { data: null, error: friendlyError };
  }
}
