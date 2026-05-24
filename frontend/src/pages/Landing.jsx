import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Landing() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  // CSS Animations injected directly
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes orbit {
        from { transform: rotate(0deg) translateX(250px) rotate(0deg); }
        to   { transform: rotate(360deg) translateX(250px) rotate(-360deg); }
      }
      @keyframes pulseGlow {
        0% { box-shadow: 0 0 10px rgba(56, 189, 248, 0.2); }
        50% { box-shadow: 0 0 30px rgba(56, 189, 248, 0.6); }
        100% { box-shadow: 0 0 10px rgba(56, 189, 248, 0.2); }
      }
      @keyframes dataFlow {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
      @keyframes floatUpDown {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      .circular-container {
        position: relative;
        width: 600px;
        height: 600px;
        margin: 50px auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .center-orb {
        width: 150px;
        height: 150px;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 900;
        font-size: 24px;
        z-index: 10;
        box-shadow: 0 0 40px rgba(139, 92, 246, 0.5);
        animation: pulseGlow 3s infinite;
        text-align: center;
      }
      .floating-card {
        position: absolute;
        width: 180px;
        height: 120px;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: #f8fafc;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      }
      .flowchart-line {
        height: 4px;
        width: 100px;
        background: linear-gradient(90deg, #38bdf8, #8b5cf6, #38bdf8);
        background-size: 200% 200%;
        animation: dataFlow 2s linear infinite;
        border-radius: 2px;
      }
      .comparison-bar {
        transition: width 1s ease-in-out;
      }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const [barsLoaded, setBarsLoaded] = useState(false);
  useEffect(() => {
    setTimeout(() => setBarsLoaded(true), 300);
  }, []);

  return (
    <div style={{ backgroundColor: "#020617", minHeight: "100vh", color: "#f8fafc", fontFamily: "system-ui, sans-serif", overflowX: "hidden" }}>
      <Navbar />

      {/* HERO SECTION */}
      <section style={{ padding: "120px 20px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(15,23,42,0) 70%)", zIndex: 0, pointerEvents: "none" }}></div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "1000px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "64px", fontWeight: "900", lineHeight: "1.1", marginBottom: "20px", letterSpacing: "-1.5px" }}>
            The Future of Technical <br />
            <span style={{ background: "linear-gradient(90deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Identity & Recruitment
            </span>
          </h1>
          <p style={{ fontSize: "22px", color: "#94a3b8", marginBottom: "40px", maxWidth: "800px", margin: "0 auto 50px" }}>
            Talent Tuner isn't just a job board. It's an intelligent ecosystem that validates your code, scores your authenticity, and deterministically matches you to the global market.
          </p>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
            <button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/register")} style={{ padding: "18px 36px", fontSize: "18px", fontWeight: "bold", borderRadius: "8px", backgroundColor: "#3b82f6", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform="translateY(-3px)"} onMouseOut={e => e.currentTarget.style.transform="translateY(0)"}>
              {isAuthenticated ? "Enter Command Center" : "Initialize Identity Free"}
            </button>
          </div>
        </div>
      </section>

      {/* CIRCULAR FLOATING CARDS - What it is & what it does */}
      <section style={{ padding: "80px 20px", backgroundColor: "#0b1120" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "40px", fontWeight: "800", marginBottom: "20px" }}>A Neural Network of Features</h2>
          <p style={{ color: "#94a3b8", fontSize: "18px", maxWidth: "600px", margin: "0 auto 0" }}>What exactly does Talent Tuner do? We orchestrate your entire professional footprint into one verifiable truth.</p>
          
          <div className="circular-container">
            <div className="center-orb">
              Core AI<br/>Engine
            </div>
            
            <div className="floating-card" style={{ animation: "orbit 20s linear infinite", animationDelay: "0s" }}>
              <span style={{ fontSize: "24px", marginBottom: "5px" }}>🔍</span>
              <strong style={{ fontSize: "14px", color: "#38bdf8" }}>Cyber Analyst</strong>
              <p style={{ fontSize: "12px", color: "#cbd5e1", margin: "5px 0 0" }}>Scans GitHub for code plagiarism & security.</p>
            </div>
            
            <div className="floating-card" style={{ animation: "orbit 20s linear infinite", animationDelay: "-5s" }}>
              <span style={{ fontSize: "24px", marginBottom: "5px" }}>📄</span>
              <strong style={{ fontSize: "14px", color: "#818cf8" }}>Resume Enhancer</strong>
              <p style={{ fontSize: "12px", color: "#cbd5e1", margin: "5px 0 0" }}>Transforms basic PDFs into ATS-beating profiles.</p>
            </div>
            
            <div className="floating-card" style={{ animation: "orbit 20s linear infinite", animationDelay: "-10s" }}>
              <span style={{ fontSize: "24px", marginBottom: "5px" }}>📊</span>
              <strong style={{ fontSize: "14px", color: "#10b981" }}>Job Scraper</strong>
              <p style={{ fontSize: "12px", color: "#cbd5e1", margin: "5px 0 0" }}>Real-time aggregated global job intelligence.</p>
            </div>

            <div className="floating-card" style={{ animation: "orbit 20s linear infinite", animationDelay: "-15s" }}>
              <span style={{ fontSize: "24px", marginBottom: "5px" }}>🛡️</span>
              <strong style={{ fontSize: "14px", color: "#f59e0b" }}>Proctored Tests</strong>
              <p style={{ fontSize: "12px", color: "#cbd5e1", margin: "5px 0 0" }}>AI-monitored environments to prove actual skill.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FLOWCHARTS / DIAGRAMS - How it does it */}
      <section style={{ padding: "100px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "40px", fontWeight: "800", marginBottom: "20px" }}>The Working Pipeline</h2>
          <p style={{ color: "#94a3b8", fontSize: "18px", maxWidth: "600px", margin: "0 auto 60px" }}>How data mathematically flows through our intelligence nodes.</p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", border: "1px solid #334155", animation: "floatUpDown 4s infinite ease-in-out" }}>
              <span style={{ fontSize: "30px" }}>📝</span>
              <h3 style={{ color: "#f8fafc", margin: "10px 0 0", fontSize: "16px" }}>Raw Footprint</h3>
              <p style={{ color: "#64748b", margin: "5px 0 0", fontSize: "12px" }}>GitHub + PDF Resume</p>
            </div>
            
            <div className="flowchart-line"></div>
            
            <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", border: "1px dashed #8b5cf6", animation: "floatUpDown 4s infinite ease-in-out", animationDelay: "1s" }}>
              <span style={{ fontSize: "30px" }}>⚙️</span>
              <h3 style={{ color: "#d8b4fe", margin: "10px 0 0", fontSize: "16px" }}>AI Deep Scan</h3>
              <p style={{ color: "#64748b", margin: "5px 0 0", fontSize: "12px" }}>Code Quality & Security</p>
            </div>
            
            <div className="flowchart-line"></div>
            
            <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", border: "1px solid #10b981", animation: "floatUpDown 4s infinite ease-in-out", animationDelay: "2s" }}>
              <span style={{ fontSize: "30px" }}>🏆</span>
              <h3 style={{ color: "#10b981", margin: "10px 0 0", fontSize: "16px" }}>Verified Profile</h3>
              <p style={{ color: "#64748b", margin: "5px 0 0", fontSize: "12px" }}>Deterministic Math Score</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY IT IS GOOD / DIFFERENT */}
      <section style={{ padding: "100px 20px", backgroundColor: "#0b1120" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "40px", fontWeight: "800", marginBottom: "20px", textAlign: "center" }}>Why Talent Tuner is Unmatched</h2>
          <p style={{ color: "#94a3b8", fontSize: "18px", maxWidth: "700px", margin: "0 auto 60px", textAlign: "center" }}>Other platforms rely on what you *say* you can do. We rely on what you can *prove*.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center" }}>
            
            {/* Left side: features list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              <div style={{ padding: "20px", backgroundColor: "#1e293b", borderRadius: "12px", borderLeft: "4px solid #f43f5e" }}>
                <h3 style={{ color: "#f8fafc", margin: "0 0 10px 0", fontSize: "20px" }}>Traditional Platforms</h3>
                <p style={{ color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>Keywords can be faked. Standard platforms just run basic text searches over unverified PDF files, allowing unqualified candidates to bypass filters.</p>
              </div>
              <div style={{ padding: "20px", backgroundColor: "#0f172a", borderRadius: "12px", borderLeft: "4px solid #38bdf8", boxShadow: "0 10px 30px rgba(56,189,248,0.1)" }}>
                <h3 style={{ color: "#38bdf8", margin: "0 0 10px 0", fontSize: "20px" }}>Talent Tuner Architecture</h3>
                <p style={{ color: "#e2e8f0", margin: 0, lineHeight: "1.5" }}>We implement **Cyber Security Analyzers** and **Hardware Proctored Tests**. We physically verify code repositories for plagiarism and lock down test environments to ensure pure authenticity.</p>
              </div>
            </div>

            {/* Right side: Animated Graph */}
            <div style={{ backgroundColor: "#1e293b", padding: "40px", borderRadius: "16px", border: "1px solid #334155" }}>
              <h3 style={{ margin: "0 0 30px 0", textAlign: "center", color: "#f8fafc" }}>Authenticity Verification Rate</h3>
              
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#94a3b8", fontSize: "14px" }}>
                  <span>Traditional Job Boards</span>
                  <span>15%</span>
                </div>
                <div style={{ width: "100%", height: "12px", backgroundColor: "#0f172a", borderRadius: "6px" }}>
                  <div className="comparison-bar" style={{ width: barsLoaded ? "15%" : "0%", height: "100%", backgroundColor: "#f43f5e", borderRadius: "6px" }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#f8fafc", fontSize: "14px", fontWeight: "bold" }}>
                  <span>Talent Tuner</span>
                  <span style={{ color: "#38bdf8" }}>98%</span>
                </div>
                <div style={{ width: "100%", height: "12px", backgroundColor: "#0f172a", borderRadius: "6px" }}>
                  <div className="comparison-bar" style={{ width: barsLoaded ? "98%" : "0%", height: "100%", backgroundColor: "#38bdf8", borderRadius: "6px", boxShadow: "0 0 10px rgba(56,189,248,0.5)" }}></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "60px 20px", textAlign: "center", borderTop: "1px solid #1e293b" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#f8fafc", margin: "0 0 10px 0" }}>Talent<span style={{ color: "#38bdf8" }}>Tuner</span></h2>
        <p style={{ color: "#64748b", margin: "0 0 30px 0" }}>The ultimate AI-driven recruitment and technical identity platform.</p>
        <button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/register")} style={{ padding: "12px 24px", fontSize: "16px", fontWeight: "bold", borderRadius: "6px", backgroundColor: "transparent", color: "#38bdf8", border: "1px solid #38bdf8", cursor: "pointer" }} onMouseOver={e => e.currentTarget.style.backgroundColor="rgba(56,189,248,0.1)"} onMouseOut={e => e.currentTarget.style.backgroundColor="transparent"}>
          Get Started Today
        </button>
      </footer>
    </div>
  );
}
