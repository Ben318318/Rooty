import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navigation from "./components/Navigation";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Learn from "./pages/Learn";
import Session from "./pages/Session";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import "./styles/globals.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/learn" element={<Learn />} />
          <Route
            path="/session"
            element={
              <PrivateRoute>
                <Session />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <Admin />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
