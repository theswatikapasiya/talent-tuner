import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Analyzer from "./pages/Analyzer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Jobs from "./pages/Jobs";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import ResumeEnhancer from "./pages/ResumeEnhancer";
import Tests from "./pages/Tests";

// Route protection for guest pages (Login/Register)
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  if (token) {
    return role === "recruiter" ? <Navigate to="/recruiter/dashboard" replace /> : <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Route protection for recruiter pages
const RecruiterRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "recruiter") return <Navigate to="/dashboard" replace />;
  return children;
};

// Generic 404 Page Component
const NotFound = () => (
  <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontFamily: "Inter, sans-serif" }}>
    <h1 style={{ fontSize: "64px", margin: "0 0 10px 0", color: "#38bdf8" }}>404</h1>
    <p style={{ color: "#94a3b8", marginBottom: "20px" }}>Signal lost. The requested module does not exist.</p>
    <a href="/" style={{ color: "#8b5cf6", textDecoration: "none", fontWeight: "bold" }}>Return to Command Center →</a>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/analyzer" element={<ProtectedRoute><Analyzer /></ProtectedRoute>} />
      <Route path="/resume" element={<ProtectedRoute><ResumeEnhancer /></ProtectedRoute>} />
      <Route path="/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      
      {/* Recruiter Routes */}
      <Route path="/recruiter/dashboard" element={<RecruiterRoute><RecruiterDashboard /></RecruiterRoute>} />
      
      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;