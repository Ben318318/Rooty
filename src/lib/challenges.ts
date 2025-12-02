/**
 * Challenge Utilities
 * Created by Nick for Sprint 2
 *
 * Helper functions for daily challenge functionality including
 * Christmas theme ID retrieval and localStorage-based completion tracking.
 */

import { getThemes } from "./api";

const CHALLENGE_STORAGE_KEY = "rooty_daily_challenges";

// Cache for Christmas theme ID to avoid repeated API calls
let cachedChristmasThemeId: number | null = null;

/**
 * Get the Christmas Special theme ID
 * Caches the result after first successful fetch
 */
export async function getChristmasThemeId(): Promise<number | null> {
  // Return cached value if available
  if (cachedChristmasThemeId !== null) {
    return cachedChristmasThemeId;
  }

  try {
    const { data, error } = await getThemes();

    if (error || !data) {
      return null;
    }

    const christmasTheme = data.find((t) => t.name === "Christmas Special");

    if (christmasTheme) {
      cachedChristmasThemeId = christmasTheme.id;
      return christmasTheme.id;
    }

    return null;
  } catch (err) {
    console.error("Error fetching Christmas theme ID:", err);
    return null;
  }
}

/**
 * Get completed challenges from localStorage
 * Returns a Set of completed challenge numbers (1-5)
 */
export function getCompletedChallenges(): Set<number> {
  try {
    const stored = localStorage.getItem(CHALLENGE_STORAGE_KEY);
    if (!stored) {
      return new Set();
    }

    const data = JSON.parse(stored);
    // Return Set of completed challenge numbers
    return new Set(data.completed || []);
  } catch (err) {
    console.error("Error reading completed challenges:", err);
    return new Set();
  }
}

/**
 * Mark a challenge as complete in localStorage
 * @param challengeNumber - The challenge number (1-5) to mark as complete
 */
export function markChallengeComplete(challengeNumber: number): void {
  try {
    const completed = getCompletedChallenges();
    completed.add(challengeNumber);

    localStorage.setItem(
      CHALLENGE_STORAGE_KEY,
      JSON.stringify({
        completed: Array.from(completed),
        date: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.error("Error marking challenge complete:", err);
  }
}

/**
 * Check if all 5 challenges are complete
 */
export function allChallengesComplete(): boolean {
  const completed = getCompletedChallenges();
  // Check if Set contains all numbers 1-5
  for (let i = 1; i <= 5; i++) {
    if (!completed.has(i)) {
      return false;
    }
  }
  return true;
}

/**
 * Reset all challenge completion data
 * Useful for demo/testing purposes
 */
export function resetChallenges(): void {
  try {
    localStorage.removeItem(CHALLENGE_STORAGE_KEY);
  } catch (err) {
    console.error("Error resetting challenges:", err);
  }
}

