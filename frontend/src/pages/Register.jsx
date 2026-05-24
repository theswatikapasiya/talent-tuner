import React, { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("candidate");
  
  const [otpMode, setOtpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
        role
      });
      
      if (res.data.isVerified) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setSuccess("Registration successful! Please check your email for the OTP.");
        setOtpMode(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/api/auth/verify-otp", {
        email,
        otp
      });
      setSuccess("Verification successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || "OTP Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = { minHeight: "100vh", backgroundColor: "transparent", color: "#e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" };
  const formBoxStyle = { backgroundColor: "#1e293b", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "15px" };
  const inputStyle = { padding: "12px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", outline: "none", width: "100%", boxSizing: "border-box" };
  const labelStyle = { display: "block", marginBottom: "5px", fontSize: "14px", color: "#94a3b8" };
  const buttonStyle = { padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#3b82f6", color: "#fff", fontWeight: "bold", cursor: "pointer", width: "100%", transition: "all 0.2s" };
  const disabledButtonStyle = { ...buttonStyle, backgroundColor: "#1e3a8a", cursor: "not-allowed" };

  return (
    <div style={containerStyle}>
      <div style={formBoxStyle}>
        <h2 style={{ textAlign: "center", margin: "0 0 10px 0" }}>Talent Tuner</h2>
        <h3 style={{ textAlign: "center", margin: "0 0 20px 0", color: "#94a3b8" }}>{otpMode ? "Verify OTP" : "Create an Account"}</h3>

        {error && <p style={{ color: "#ef4444", fontSize: "14px", margin: "0" }}>{error}</p>}
        {success && <p style={{ color: "#10b981", fontSize: "14px", margin: "0" }}>{success}</p>}

        {!otpMode ? (
          <>
            <input style={inputStyle} type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div>
              <label style={labelStyle}>I am a</label>
              <select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="candidate">Job Seeker</option>
                <option value="recruiter">Recruiter / Company</option>
              </select>
            </div>
            <button style={loading ? disabledButtonStyle : buttonStyle} onClick={handleRegister} disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            <p style={{ textAlign: "center", fontSize: "14px", margin: "10px 0 0 0", color: "#94a3b8" }}>
              Already have an account? <span style={{ color: "#3b82f6", cursor: "pointer" }} onClick={() => navigate("/login")}>Login</span>
            </p>
          </>
        ) : (
          <>
            <input style={inputStyle} type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button style={loading ? disabledButtonStyle : buttonStyle} onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;