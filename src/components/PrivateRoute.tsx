import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div
        className="container"
        style={{ marginTop: "2rem", textAlign: "center" }}
      >
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

