/**
 * QuizCard Component
 * Created by Nick
 *
 * Interactive quiz card for practicing word roots.
 */

import React, { useState } from "react";
import type { Root } from "../../lib/supabase";
import TextInput from "../TextInput";
import Button from "../Button";
import styles from "./QuizCard.module.css";

interface QuizCardProps {
  root: Root;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
}

export default function QuizCard({
  root,
  questionNumber,
  totalQuestions,
  onAnswer,
}: QuizCardProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;

    // Simple check: does the user's answer contain the correct meaning?
    const normalizedAnswer = userAnswer.toLowerCase().trim();
    const normalizedMeaning = root.meaning.toLowerCase().trim();

    // Check if answer is close enough (contains key words or exact match)
    const isCorrect =
      normalizedAnswer === normalizedMeaning ||
      normalizedMeaning.includes(normalizedAnswer) ||
      normalizedAnswer.includes(normalizedMeaning);

    setFeedback(isCorrect ? "correct" : "incorrect");
    setSubmitted(true);
    onAnswer(isCorrect, userAnswer);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !submitted) {
      handleSubmit();
    }
  };

  return (
    <div className={styles.quizCard}>
      <div className={styles.header}>
        <div className={styles.progress}>
          Question {questionNumber} of {totalQuestions}
        </div>
        <div className={styles.rootText}>{root.root_text}</div>
        <div className={styles.origin}>Origin: {root.origin_lang}</div>
      </div>

      {root.examples && root.examples.length > 0 && (
        <div className={styles.examples}>
          <div className={styles.examplesTitle}>Example words:</div>
          <div className={styles.examplesList}>
            {root.examples.map((example, index) => (
              <span key={index} className={styles.exampleTag}>
                {example}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.answerSection}>
        <p style={{ marginBottom: "1rem", fontWeight: 500 }}>
          What does this root mean?
        </p>
        <TextInput
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your answer..."
          disabled={submitted}
          error={feedback === "incorrect"}
          className={styles.answerInput}
        />

        {!submitted && (
          <Button
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            fullWidth
          >
            Submit Answer
          </Button>
        )}
      </div>

      {feedback && (
        <div className={`${styles.feedback} ${styles[feedback]}`}>
          {feedback === "correct" ? (
            <>
              ✓ Correct! The root <strong>{root.root_text}</strong> means "
              {root.meaning}".
            </>
          ) : (
            <>
              ✗ Not quite. The root <strong>{root.root_text}</strong> means "
              {root.meaning}".
            </>
          )}
        </div>
      )}

      <div className={styles.source}>
        Source:{" "}
        <a
          href={root.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.sourceLink}
        >
          {root.source_title}
        </a>
      </div>
    </div>
  );
}
