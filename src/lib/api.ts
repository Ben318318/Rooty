import { supabase } from "./supabase";
import type { Theme, Root, WordRoot } from "./supabase";

export interface SessionRoot extends Root {}

export interface WordSessionItem extends WordRoot {}

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

export async function getWordSession(
  themeId?: number | null,
  limit: number = 10
): Promise<{ data: WordSessionItem[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_get_word_session", {
      theme_id_param: themeId ?? null,
      limit_count: limit,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data as WordSessionItem[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

export async function submitAttempt(
  rootId: number,
  isCorrect: boolean,
  userAnswer: string,
  themeId?: number | null
): Promise<{ data: SubmitAttemptResponse | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_submit_attempt", {
      root_id_param: rootId,
      word_root_id_param: null,
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

export async function submitWordAttempt(
  wordRootId: number,
  selectedOption: string,
  isCorrect: boolean,
  themeId?: number | null
): Promise<{ data: SubmitAttemptResponse | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_submit_attempt", {
      root_id_param: null,
      word_root_id_param: wordRootId,
      theme_id_param: themeId ?? null,
      is_correct_param: isCorrect,
      user_answer_param: selectedOption,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data as SubmitAttemptResponse, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

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
