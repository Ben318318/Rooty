/**
 * ThemeCard Component
 * Created by Nick
 *
 * Displays a weekly theme with visual appeal for the Learn page.
 */

import React from "react";
import type { Theme } from "../../lib/supabase";
import styles from "./ThemeCard.module.css";

interface ThemeCardProps {
  theme: Theme;
  onClick?: () => void;
  rootsCount?: number;
}

export default function ThemeCard({
  theme,
  onClick,
  rootsCount,
}: ThemeCardProps) {
  const weekDate = new Date(theme.week_start).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={styles.themeCard} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.week}>Week starting {weekDate}</div>
        <h3 className={styles.title}>{theme.name}</h3>
      </div>

      {theme.description && (
        <p className={styles.description}>{theme.description}</p>
      )}

      <div className={styles.footer}>
        {rootsCount !== undefined && (
          <span className={styles.rootsCount}>
            {rootsCount} root{rootsCount !== 1 ? "s" : ""}
          </span>
        )}
        <span className={styles.arrow}>→</span>
      </div>
    </div>
  );
}
