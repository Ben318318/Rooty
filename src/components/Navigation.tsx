import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => {
    return location.pathname === path ? styles.active : "";
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          🌱 Rooty
        </Link>

        <div className={styles.links}>
          <Link to="/" className={`${styles.link} ${isActive("/")}`}>
            Home
          </Link>
          {user && (
            <>
              <Link
                to="/learn"
                className={`${styles.link} ${isActive("/learn")}`}
              >
                Learn
              </Link>
              <Link
                to="/profile"
                className={`${styles.link} ${isActive("/profile")}`}
              >
                Profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`${styles.link} ${isActive("/admin")}`}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        <div className={styles.auth}>
          {user ? (
            <>
              <span className={styles.userName}>
                {user.email?.split("@")[0] || "User"}
              </span>
              <Button onClick={handleSignOut} variant="ghost" size="small">
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="primary" size="small">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

