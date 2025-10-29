/**
 * Review Page
 * Created by Nick
 *
 * Practice page for reviewing wrong answers from the queue.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReview, submitAttempt } from "../lib/api";
import type { ReviewRoot } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import QuizCard from "../components/QuizCard";
import Button from "../components/Button";
import Card, { CardContent } from "../components/Card";

export default function Review() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reviewRoots, setReviewRoots] = useState<ReviewRoot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    loadReviewQueue();
  }, [user]);

  const loadReviewQueue = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: reviewError } = await getReview(10);

      if (reviewError) {
        throw reviewError;
      }

      if (!data || data.length === 0) {
        setError("No items in your review queue. Great job!");
        return;
      }

      setReviewRoots(data);
    } catch (err) {
      console.error("Error loading review queue:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load review queue"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (isCorrect: boolean, userAnswer: string) => {
    const currentRoot = reviewRoots[currentIndex];

    // Submit attempt to backend (will remove from queue if correct)
    try {
      await submitAttempt(currentRoot.root_id, isCorrect, userAnswer);

      if (isCorrect) {
        setCorrectCount(correctCount + 1);
      }

      // Wait before moving to next question
      setTimeout(() => {
        if (currentIndex < reviewRoots.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setReviewComplete(true);
        }
      }, 2000);
    } catch (err) {
      console.error("Error submitting review attempt:", err);
    }
  };

  if (loading) {
    return (
      <div
        className="container"
        style={{ marginTop: "2rem", textAlign: "center" }}
      >
        <h2>Loading review queue...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container"
        style={{ marginTop: "2rem", maxWidth: "600px" }}
      >
        <h1 style={{ marginBottom: "2rem" }}>Review Queue</h1>
        <Card>
          <CardContent>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✓</div>
              <h2>All Caught Up!</h2>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginTop: "1rem",
                }}
              >
                {error}
              </p>
              <Button
                onClick={() => navigate("/learn")}
                style={{ marginTop: "1.5rem" }}
              >
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reviewComplete) {
    return (
      <div
        className="container"
        style={{ marginTop: "2rem", textAlign: "center" }}
      >
        <h1 style={{ marginBottom: "1rem" }}>Review Complete! 🎉</h1>

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
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📚</div>
          <h2 style={{ marginBottom: "1rem" }}>Review Summary</h2>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "var(--color-success)",
              marginBottom: "0.5rem",
            }}
          >
            {correctCount} Mastered
          </div>
          <p style={{ color: "var(--color-text-secondary)" }}>
            out of {reviewRoots.length} reviewed
          </p>

          {correctCount < reviewRoots.length && (
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Incorrect answers will remain in your review queue.
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Button onClick={() => window.location.reload()} variant="primary">
            Review Again
          </Button>
          <Button onClick={() => navigate("/profile")} variant="ghost">
            View Profile
          </Button>
        </div>
      </div>
    );
  }

  const currentRoot = reviewRoots[currentIndex];

  return (
    <div
      className="container"
      style={{ marginTop: "2rem", paddingBottom: "3rem" }}
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1>Review Mistakes</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Correct answers: {correctCount} | Reviewed incorrectly{" "}
          {currentRoot.times_incorrect} time
          {currentRoot.times_incorrect > 1 ? "s" : ""}
        </p>
      </div>

      <QuizCard
        root={currentRoot}
        questionNumber={currentIndex + 1}
        totalQuestions={reviewRoots.length}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
