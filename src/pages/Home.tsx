/**
 * Home Page
 * Created by Gabriel
 * Enhanced by Nick with navigation
 *
 * Landing page for the Rooty application.
 */

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Card, { CardHeader, CardContent } from "../components/Card";

export default function Home() {
  const { user } = useAuth();

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
          Learn Latin and Greek word roots through weekly themed quizzes
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
          <Link to="/profile" style={{ textDecoration: "none" }}>
            <Button fullWidth variant="ghost" size="large">
              View Profile
            </Button>
          </Link>
        ) : (
          <Link to="/auth" style={{ textDecoration: "none" }}>
            <Button fullWidth variant="ghost" size="large">
              Sign In
            </Button>
          </Link>
        )}
      </div>

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
          <CardHeader title="📚 100 Roots" />
          <CardContent>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Learn from a curated collection of essential Latin and Greek word
              roots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="📅 Weekly Themes" />
          <CardContent>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Organized learning paths with themed weekly content
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
