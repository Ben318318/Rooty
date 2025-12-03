import React, { useState } from "react";
import type { Root, WordRoot } from "../../lib/supabase";
import TextInput from "../TextInput";
import Button from "../Button";
import MultipleChoice from "../MultipleChoice";
import styles from "./QuizCard.module.css";

interface QuizCardProps {
  root?: Root;
  wordRoot?: WordRoot;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
}

export default function QuizCard({
  root,
  wordRoot,
  questionNumber,
  totalQuestions,
  onAnswer,
}: QuizCardProps) {
  if (wordRoot) {
    return (
      <WordQuizCard
        wordRoot={wordRoot}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        onAnswer={onAnswer}
      />
    );
  }

  if (root) {
    return (
      <RootQuizCard
        root={root}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        onAnswer={onAnswer}
      />
    );
  }

  return null;
}

function RootQuizCard({
  root,
  questionNumber,
  totalQuestions,
  onAnswer,
}: {
  root: Root;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;

    const normalizedAnswer = userAnswer.toLowerCase().trim();
    const normalizedMeaning = root.meaning.toLowerCase().trim();

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

function WordQuizCard({
  wordRoot,
  questionNumber,
  totalQuestions,
  onAnswer,
}: {
  wordRoot: WordRoot;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [submitted, setSubmitted] = useState(false);

  const options = [
    wordRoot.option_1,
    wordRoot.option_2,
    wordRoot.option_3,
    wordRoot.option_4,
  ];

  const handleSelect = (option: string) => {
    if (submitted) return;

    setSelectedAnswer(option);
    const isCorrect = option === wordRoot.correct_meaning;
    setFeedback(isCorrect ? "correct" : "incorrect");
    setSubmitted(true);
    onAnswer(isCorrect, option);
  };

  return (
    <div className={styles.quizCard}>
      <div className={styles.header}>
        <div className={styles.progress}>
          Question {questionNumber} of {totalQuestions}
        </div>
        <div className={styles.wordText}>{wordRoot.english_word}</div>
        <div className={styles.origin}>Origin: {wordRoot.origin_lang}</div>
      </div>

      <div className={styles.componentRoots}>
        <div className={styles.componentRootsTitle}>
          The Latin/Greek word(s) this word is made up of:
        </div>
        <div className={styles.componentRootsText}>
          {wordRoot.component_roots}
        </div>
      </div>

      <div className={styles.answerSection}>
        <p style={{ marginBottom: "1rem", fontWeight: 500 }}>
          What does this root mean?
        </p>
        <MultipleChoice
          options={options}
          correctAnswer={wordRoot.correct_meaning}
          selectedAnswer={selectedAnswer}
          onSelect={handleSelect}
          disabled={submitted}
          showFeedback={submitted}
        />
      </div>

      {feedback && (
        <div className={`${styles.feedback} ${styles[feedback]}`}>
          {feedback === "correct" ? (
            <>
              ✓ Correct! The root <strong>{wordRoot.component_roots}</strong>{" "}
              means "{wordRoot.correct_meaning}".
            </>
          ) : (
            <>
              ✗ Not quite. The root <strong>{wordRoot.component_roots}</strong>{" "}
              means "{wordRoot.correct_meaning}".
            </>
          )}
        </div>
      )}

      {wordRoot.source_url && wordRoot.source_title && (
        <div className={styles.source}>
          Source:{" "}
          <a
            href={wordRoot.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            {wordRoot.source_title}
          </a>
        </div>
      )}
    </div>
  );
}
