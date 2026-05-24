import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    backgroundColor: "rgba(15, 23, 42, 0.8)", // Glassmorphism Match app dark theme
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "#ffffff",
    borderBottom: "1px solid rgba(30, 41, 59, 0.8)",
    fontFamily: "Inter, sans-serif",
    position: "sticky",
    top: 0,
    zIndex: 1000
  };

  const logoStyle = {
    fontSize: "24px",
    fontWeight: "900",
    textDecoration: "none",
    color: "#f8fafc",
    letterSpacing: "-0.5px"
  };

  const linkContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "30px",
  };

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      textDecoration: "none",
      color: isActive ? "#38bdf8" : "#94a3b8",
      fontSize: "15px",
      fontWeight: isActive ? "700" : "500",
      paddingBottom: "4px",
      borderBottom: isActive ? "2px solid #38bdf8" : "2px solid transparent",
      transition: "color 0.2s, border-color 0.2s"
    };
  };

  const buttonStyle = {
    backgroundColor: "#1e293b",
    color: "#cbd5e1",
    border: "1px solid #334155",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.2s"
  };

  const isAuthenticated = !!localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  return (
    <>
      {/* Global Animated Background Orbs */}
      <div className="bg-orb-1"></div>
      <div className="bg-orb-2"></div>
      <div className="bg-orb-3"></div>

      <nav style={navStyle}>
      <Link to="/" style={logoStyle}>
        Talent<span style={{color: "#38bdf8"}}>Tuner</span>
      </Link>
      
      <div style={linkContainerStyle}>
        <style>{`.nav-link:hover { color: #f8fafc !important; } .logout-btn:hover { background-color: #334155 !important; color: #fff !important; border-color: #475569 !important; } .primary-btn:hover { background-color: #2563eb !important; }`}</style>
        
        {isAuthenticated ? (
          userRole === "recruiter" ? (
            <>
              <button onClick={handleLogout} className="logout-btn" style={buttonStyle}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/resume" className="nav-link" style={getLinkStyle("/resume")}>Resume Enhancer</Link>
              <Link to="/tests" className="nav-link" style={getLinkStyle("/tests")}>Test your skills</Link>
              <Link to="/jobs" className="nav-link" style={getLinkStyle("/jobs")}>Job search</Link>
              <Link to="/dashboard" className="nav-link" style={getLinkStyle("/dashboard")}>Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn" style={buttonStyle}>Logout</button>
            </>
          )
        ) : (
          <>
            <a href="#home" className="nav-link" style={{ ...getLinkStyle("/"), borderBottom: "none", color: "#e2e8f0" }}>Home</a>
            <a href="#features" className="nav-link" style={{ ...getLinkStyle("/"), borderBottom: "none", color: "#94a3b8" }}>Features</a>
            <a href="#flow" className="nav-link" style={{ ...getLinkStyle("/"), borderBottom: "none", color: "#94a3b8" }}>Intelligence Flow</a>
            
            <div style={{ width: "1px", height: "24px", backgroundColor: "#334155", margin: "0 10px" }}></div>
            
            <Link to="/login" className="nav-link" style={{ ...getLinkStyle("/login"), borderBottom: "none" }}>Login</Link>
            <button 
              className="primary-btn" 
              onClick={() => navigate("/register")}
              style={{
                backgroundColor: "#3b82f6",
                color: "#fff",
                border: "none",
                padding: "8px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "all 0.2s"
              }}
            >
              Get Started
            </button>
          </>
        )}
      </div>
      </nav>
    </>
  );
}

export default Navbar;
