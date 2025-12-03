import { getThemes } from "./api";

const CHALLENGE_STORAGE_KEY = "rooty_daily_challenges";

let cachedChristmasThemeId: number | null = null;

export async function getChristmasThemeId(): Promise<number | null> {
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

export function getCompletedChallenges(): Set<number> {
  try {
    const stored = localStorage.getItem(CHALLENGE_STORAGE_KEY);
    if (!stored) {
      return new Set();
    }

    const data = JSON.parse(stored);
    return new Set(data.completed || []);
  } catch (err) {
    console.error("Error reading completed challenges:", err);
    return new Set();
  }
}

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

export function allChallengesComplete(): boolean {
  const completed = getCompletedChallenges();
  for (let i = 1; i <= 4; i++) {
    if (!completed.has(i)) {
      return false;
    }
  }
  return true;
}

