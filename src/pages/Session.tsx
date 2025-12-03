import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSession, getWordSession, submitAttempt, submitWordAttempt } from "../lib/api";
import type { SessionRoot, WordSessionItem } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { markChallengeComplete } from "../lib/challenges";
import QuizCard from "../components/QuizCard";
import Button from "../components/Button";

export default function Session() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const themeId = searchParams.get("theme")
    ? Number(searchParams.get("theme"))
    : null;

  const challengeParam = searchParams.get("challenge");
  const challengeNumber = challengeParam ? Number(challengeParam) : null;

  const [roots, setRoots] = useState<SessionRoot[]>([]);
  const [wordRoots, setWordRoots] = useState<WordSessionItem[]>([]);
  const [useWordQuiz, setUseWordQuiz] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);

  useEffect(() => {
    loadSession();
  }, [themeId, useWordQuiz]);

  useEffect(() => {
    if (sessionComplete && challengeNumber && challengeNumber >= 1 && challengeNumber <= 4) {
      markChallengeComplete(challengeNumber);
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionComplete, challengeNumber, navigate]);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout - please check your connection")), 10000)
      );

      if (useWordQuiz) {
        const { data, error: sessionError } = await Promise.race([
          getWordSession(themeId, 10),
          timeoutPromise,
        ]) as { data: WordSessionItem[] | null; error: Error | null };

        if (sessionError) {
          throw sessionError;
        }

        if (!data || data.length === 0) {
          setError("No words available for this session.");
          return;
        }

        setWordRoots(data);
      } else {
        const { data, error: sessionError } = await Promise.race([
          getSession(themeId, 10),
          timeoutPromise,
        ]) as { data: SessionRoot[] | null; error: Error | null };

        if (sessionError) {
          throw sessionError;
        }

        if (!data || data.length === 0) {
          setError("No roots available for this session.");
          return;
        }

        setRoots(data);
      }
    } catch (err) {
      console.error("Error loading session:", err);
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (isCorrect: boolean, userAnswer: string) => {
    try {
      if (useWordQuiz) {
        const currentWordRoot = wordRoots[currentIndex];
        await submitWordAttempt(currentWordRoot.id, userAnswer, isCorrect, themeId);
      } else {
        const currentRoot = roots[currentIndex];
        await submitAttempt(currentRoot.id, isCorrect, userAnswer, themeId);
      }

      if (isCorrect) {
        setScore(score + 1);
      }

      setAnsweredQuestions(answeredQuestions + 1);

      const totalQuestions = useWordQuiz ? wordRoots.length : roots.length;
      setTimeout(() => {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setSessionComplete(true);
        }
      }, 2000);
    } catch (err) {
      console.error("Error submitting attempt:", err);
    }
  };

  if (loading) {
    return (
      <div
        className="container"
        style={{ marginTop: "2rem", textAlign: "center" }}
      >
        <h2>Loading quiz session...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container"
        style={{ marginTop: "2rem", textAlign: "center" }}
      >
        <h2>Error Loading Session</h2>
        <p style={{ color: "var(--color-danger)", marginTop: "1rem" }}>
          {error}
        </p>
        <Button
          onClick={() => navigate("/learn")}
          style={{ marginTop: "1rem" }}
        >
          Back to Learn
        </Button>
      </div>
    );
  }

  if (sessionComplete) {
    const totalQuestions = useWordQuiz ? wordRoots.length : roots.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div
        className="container"
        style={{ marginTop: "2rem", textAlign: "center" }}
      >
        <h1 style={{ marginBottom: "1rem" }}>Session Complete! 🎉</h1>

        {challengeNumber && challengeNumber >= 1 && challengeNumber <= 4 && (
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--color-success)",
              marginBottom: "1rem",
              fontWeight: 500,
            }}
          >
            Challenge {challengeNumber} completed! ✅
          </p>
        )}

        <div
          style={{
            maxWidth: "500px",
            margin: "2rem auto",
            padding: "2rem",
            backgroundColor: "white",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
            {percentage >= 80 ? "🌟" : percentage >= 60 ? "👍" : "📚"}
          </div>
          <h2 style={{ marginBottom: "1rem" }}>Your Score</h2>
          <div
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: "var(--color-primary)",
              marginBottom: "0.5rem",
            }}
          >
            {score} / {useWordQuiz ? wordRoots.length : roots.length}
          </div>
          <div
            style={{ fontSize: "1.5rem", color: "var(--color-text-secondary)" }}
          >
            {percentage}%
          </div>

          <p
            style={{
              marginTop: "1.5rem",
              color: "var(--color-text-secondary)",
            }}
          >
            {percentage >= 80
              ? "Excellent work!"
              : percentage >= 60
              ? "Good job! Keep practicing!"
              : "Keep learning!"}
          </p>
        </div>

        {challengeNumber && challengeNumber >= 1 && challengeNumber <= 4 ? (
          <p style={{ color: "var(--color-text-secondary)", marginTop: "1rem" }}>
            Returning to home page...
          </p>
        ) : (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Button onClick={() => navigate("/learn")} variant="primary">
              Back to Learn
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ marginTop: "2rem", paddingBottom: "3rem" }}
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1>Quiz Session</h1>
        {challengeNumber && challengeNumber >= 1 && challengeNumber <= 4 && (
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--color-primary)",
              marginBottom: "0.5rem",
              fontWeight: 500,
            }}
          >
            Challenge {challengeNumber} of 4
          </p>
        )}
        <p style={{ color: "var(--color-text-secondary)" }}>
          Score: {score} / {answeredQuestions} ({useWordQuiz ? wordRoots.length : roots.length} questions)
        </p>
      </div>

      {useWordQuiz ? (
        <QuizCard
          key={`question-${currentIndex}-${wordRoots[currentIndex]?.id}`}
          wordRoot={wordRoots[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={wordRoots.length}
          onAnswer={handleAnswer}
        />
      ) : (
        <QuizCard
          key={`question-${currentIndex}-${roots[currentIndex]?.id}`}
          root={roots[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={roots.length}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
}
