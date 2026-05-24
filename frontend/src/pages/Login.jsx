import React, { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post(
        "/api/auth/login",
        { email, password }
      );
      const token = res.data.token;
      const role = res.data.user?.role || "developer";
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
      
      if (role === "recruiter") {
        navigate("/recruiter/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = { minHeight: "100vh", backgroundColor: "transparent", color: "#e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" };
  const formBoxStyle = { backgroundColor: "#1e293b", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "15px" };
  const inputStyle = { padding: "12px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", outline: "none", width: "100%", boxSizing: "border-box" };
  const buttonStyle = { padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#3b82f6", color: "#fff", fontWeight: "bold", cursor: "pointer", width: "100%", transition: "all 0.2s" };
  const disabledButtonStyle = { ...buttonStyle, backgroundColor: "#1e3a8a", cursor: "not-allowed" };

  return (
    <div style={containerStyle}>
      <div style={formBoxStyle}>
        <h2 style={{ textAlign: "center", margin: "0 0 10px 0" }}>Talent Tuner</h2>
        <h3 style={{ textAlign: "center", margin: "0 0 20px 0", color: "#94a3b8" }}>Login to your account</h3>

        {error && <p style={{ color: "#ef4444", fontSize: "14px", margin: "0" }}>{error}</p>}

        <input
          style={inputStyle}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button style={loading ? disabledButtonStyle : buttonStyle} onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", margin: "10px 0 0 0", color: "#94a3b8" }}>
          Don't have an account? <span style={{ color: "#3b82f6", cursor: "pointer" }} onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
}

export default Login;