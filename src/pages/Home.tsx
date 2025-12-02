/**
 * Home Page
 * Created by Gabriel
 * Enhanced by Nick with navigation and daily challenges
 *
 * Landing page for the Rooty application.
 */

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Card, { CardHeader, CardContent } from "../components/Card";
import {
  getChristmasThemeId,
  getCompletedChallenges,
  allChallengesComplete,
  resetChallenges,
} from "../lib/challenges";

export default function Home() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [christmasThemeId, setChristmasThemeId] = useState<number | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(
    new Set()
  );

  // Load Christmas theme ID on mount
  useEffect(() => {
    const loadThemeId = async () => {
      if (user) {
        const themeId = await getChristmasThemeId();
        setChristmasThemeId(themeId);
      }
    };
    loadThemeId();
  }, [user]);

  // Refresh completed challenges when user changes or location changes (navigation)
  useEffect(() => {
    if (user) {
      setCompletedChallenges(getCompletedChallenges());
    } else {
      setCompletedChallenges(new Set());
    }
  }, [user, location]);

  /**
   * Get the status of a challenge
   */
  const getChallengeStatus = (
    challengeNumber: number
  ): "not-started" | "in-progress" | "completed" => {
    if (completedChallenges.has(challengeNumber)) {
      return "completed";
    }
    return "not-started";
  };

  /**
   * Check if a challenge is completed
   */
  const isChallengeCompleted = (challengeNumber: number): boolean => {
    return completedChallenges.has(challengeNumber);
  };

  /**
   * Handle challenge card click
   */
  const handleChallengeClick = (challengeNumber: number) => {
    if (!christmasThemeId) {
      console.error("Christmas theme ID not loaded");
      return;
    }
    navigate(`/session?theme=${christmasThemeId}&challenge=${challengeNumber}`);
  };

  /**
   * Handle reset challenges button click
   */
  const handleResetChallenges = () => {
    resetChallenges();
    setCompletedChallenges(new Set());
  };

  /**
   * Get status badge styling
   */
  const getStatusBadgeStyle = (status: string) => {
    const baseStyle = {
      display: "inline-block",
      padding: "0.25rem 0.75rem",
      borderRadius: "var(--radius-full)",
      fontSize: "0.875rem",
      fontWeight: 500,
    };

    switch (status) {
      case "completed":
        return {
          ...baseStyle,
          backgroundColor: "var(--color-success-light)",
          color: "var(--color-success)",
        };
      case "in-progress":
        return {
          ...baseStyle,
          backgroundColor: "var(--color-warning-light)",
          color: "var(--color-warning)",
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: "var(--color-bg-tertiary)",
          color: "var(--color-text-secondary)",
        };
    }
  };

  return (
    <div className="container" style={{ marginTop: "4rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌱 Rooty</h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "var(--color-text-secondary)",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Learn Latin and Greek word roots through Christmas-themed quizzes
        </p>
      </div>

      <div
        style={{
          maxWidth: "400px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Link to="/learn" style={{ textDecoration: "none" }}>
          <Button fullWidth size="large">
            Start Learning
          </Button>
        </Link>
        {user ? (
          <>
            <Link to="/profile" style={{ textDecoration: "none" }}>
              <Button fullWidth variant="ghost" size="large">
                View Profile
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin" style={{ textDecoration: "none" }}>
                <Button fullWidth variant="ghost" size="large">
                  Admin Console
                </Button>
              </Link>
            )}
          </>
        ) : (
          <Link to="/auth" style={{ textDecoration: "none" }}>
            <Button fullWidth variant="ghost" size="large">
              Sign In
            </Button>
          </Link>
        )}
      </div>

      {/* Daily Challenge Section */}
      {user && (
        <div
          style={{
            marginTop: "4rem",
            maxWidth: "900px",
            margin: "4rem auto 0",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "1.75rem",
              marginBottom: "2rem",
              color: "var(--color-text)",
            }}
          >
            🎄 Daily Root Challenges – Christmas Special
          </h2>

          {allChallengesComplete() ? (
            <Card
              style={{
                textAlign: "center",
                padding: "3rem 2rem",
                backgroundColor: "var(--color-success-light)",
                border: "2px solid var(--color-success)",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  marginBottom: "0.5rem",
                  color: "var(--color-success)",
                }}
              >
                You've finished today's 5 challenges!
              </h3>
              <p
                style={{
                  fontSize: "1.125rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Come back tomorrow for more!
              </p>
              {isAdmin && (
                <Button
                  onClick={handleResetChallenges}
                  variant="ghost"
                  style={{ marginTop: "1.5rem" }}
                >
                  Reset Challenges (Demo)
                </Button>
              )}
            </Card>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "1rem",
                }}
              >
                {[1, 2, 3, 4, 5].map((challengeNumber) => {
                  const status = getChallengeStatus(challengeNumber);
                  const isCompleted = isChallengeCompleted(challengeNumber);

                  return (
                    <Card
                      key={challengeNumber}
                      clickable={!isCompleted}
                      onClick={() => !isCompleted && handleChallengeClick(challengeNumber)}
                      style={{
                        opacity: isCompleted ? 0.6 : 1,
                        cursor: isCompleted ? "default" : "pointer",
                      }}
                    >
                      <CardHeader
                        title={`Challenge ${challengeNumber} of 5`}
                      />
                      <CardContent>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={getStatusBadgeStyle(status)}>
                            {status === "completed"
                              ? "Completed ✅"
                              : status === "in-progress"
                              ? "In progress"
                              : "Not started"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {isAdmin && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <Button
                    onClick={handleResetChallenges}
                    variant="ghost"
                    size="small"
                  >
                    Reset Challenges (Demo)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: "4rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          maxWidth: "900px",
          margin: "4rem auto 0",
        }}
      >
        <Card>
          <CardHeader title="📚 50 Christmas Roots" />
          <CardContent>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Learn from a curated collection of 50 essential Christmas-themed Latin and Greek word roots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="🎄 Christmas Special" />
          <CardContent>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Focused learning path with Christmas-themed content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="🔄 Review System" />
          <CardContent>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Practice mistakes until mastered with our smart review queue
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
