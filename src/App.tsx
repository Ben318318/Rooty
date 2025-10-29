/**
 * Main App Component
 * Created by Gabriel
 * Enhanced by Nick with additional routes
 *
 * Root component with routing and authentication provider.
 */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Learn from "./pages/Learn";
import Session from "./pages/Session";
import Review from "./pages/Review";
import Profile from "./pages/Profile";
import "./styles/globals.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/session" element={<Session />} />
          <Route path="/review" element={<Review />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
