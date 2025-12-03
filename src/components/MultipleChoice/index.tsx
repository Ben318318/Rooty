import React, { useState, useEffect } from "react";
import styles from "./MultipleChoice.module.css";

interface MultipleChoiceProps {
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  onSelect: (option: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
}

export default function MultipleChoice({
  options,
  correctAnswer,
  selectedAnswer,
  onSelect,
  disabled = false,
  showFeedback = false,
}: MultipleChoiceProps) {
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  useEffect(() => {
    const shuffled = [...options];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setShuffledOptions(shuffled);
  }, [options, correctAnswer]);

  const getOptionClass = (option: string, index: number) => {
    if (!selectedAnswer) {
      return styles.option;
    }

    if (option === selectedAnswer) {
      if (option === correctAnswer) {
        return `${styles.option} ${styles.correct}`;
      } else {
        return `${styles.option} ${styles.incorrect}`;
      }
    }

    if (option === correctAnswer && showFeedback) {
      return `${styles.option} ${styles.correct}`;
    }

    return `${styles.option} ${styles.disabled}`;
  };

  return (
    <div className={styles.multipleChoice}>
      {shuffledOptions.map((option, index) => (
        <button
          key={index}
          className={getOptionClass(option, index)}
          onClick={() => !disabled && !selectedAnswer && onSelect(option)}
          disabled={disabled || selectedAnswer !== null}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

