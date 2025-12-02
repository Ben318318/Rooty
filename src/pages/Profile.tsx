/**
 * Profile Page
 * Created by Nick
 *
 * User profile with statistics dashboard.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStatsOverview } from "../lib/api";
import type { StatsResponse } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import StatBadge from "../components/StatBadge";
import Button from "../components/Button";
import Card, { CardHeader, CardContent } from "../components/Card";

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin } = useAuth();

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: statsError } = await getStatsOverview();

      if (statsError) {
        throw statsError;
      }

      if (data && data.success) {
        setStats(data);
      } else {
        throw new Error("Failed to load stats");
      }
    } catch (err) {
      console.error("Error loading stats:", err);
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div
        className="container"
        style={{ marginTop: "2rem", textAlign: "center" }}
      >
        <h2>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ marginTop: "2rem", paddingBottom: "3rem" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "0.5rem" }}>
            {profile?.display_name || "Your Profile"}
          </h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Role: {profile?.role || "learner"}
          </p>
        </div>
        <Button onClick={handleSignOut} variant="ghost">
          Sign Out
        </Button>
      </div>

      {error && (
        <Card
          style={{
            marginBottom: "2rem",
            borderLeft: "4px solid var(--color-danger)",
          }}
        >
          <CardContent>
            <p style={{ color: "var(--color-danger)" }}>
              Error loading stats: {error}
            </p>
            <Button
              onClick={loadStats}
              size="small"
              style={{ marginTop: "1rem" }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {stats && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginBottom: "3rem",
            }}
          >
            <StatBadge
              icon="📊"
              value={`${stats.accuracy_percent}%`}
              label="Accuracy"
              variant="success"
            />
            <StatBadge
              icon="🌱"
              value={stats.roots_learned}
              label="Roots Learned"
              variant="info"
            />
            <StatBadge
              icon="🔥"
              value={stats.current_streak}
              label="Current Streak"
              variant="warning"
            />
            <StatBadge
              icon="✓"
              value={`${stats.correct_attempts}/${stats.total_attempts}`}
              label="Correct Answers"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
            }}
          >
            <Card>
              <CardHeader title="Progress Overview" />
              <CardContent>
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span>Total Attempts</span>
                    <strong>{stats.total_attempts}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                      fontSize: "0.875rem",
                      color: "var(--color-success)",
                    }}
                  >
                    <span>Correct</span>
                    <strong>{stats.correct_attempts}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.875rem",
                      color: "var(--color-danger)",
                    }}
                  >
                    <span>Incorrect</span>
                    <strong>
                      {stats.total_attempts - stats.correct_attempts}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    backgroundColor: "var(--color-bg-tertiary)",
                    borderRadius: "var(--radius-full)",
                    overflow: "hidden",
                    marginTop: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: `${stats.accuracy_percent}%`,
                      height: "100%",
                      backgroundColor: "var(--color-success)",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Quick Actions" />
              <CardContent>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <Button
                    onClick={() => navigate("/learn")}
                    variant="primary"
                    fullWidth
                  >
                    Start Learning
                  </Button>
                  <Button
                    onClick={() => navigate("/review")}
                    variant="secondary"
                    fullWidth
                  >
                    Review Mistakes
                  </Button>
                  {isAdmin && (
                    <Button
                      onClick={() => navigate("/admin")}
                      variant="secondary"
                      fullWidth
                    >
                      Admin Console
                    </Button>
                  )}
                  <Button
                    onClick={loadStats}
                    variant="ghost"
                    size="small"
                    fullWidth
                  >
                    Refresh Stats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {!stats && !error && (
        <Card>
          <CardContent>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📊</div>
              <h2>No stats yet</h2>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginTop: "1rem",
                }}
              >
                Start learning to track your progress!
              </p>
              <Button
                onClick={() => navigate("/learn")}
                style={{ marginTop: "1.5rem" }}
              >
                Start Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
