import React, { useState, useEffect } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";

function Analyzer() {
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Persistence States
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Auto-restore last analysis from localStorage on mount
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem("talentTuner_lastAnalysis");
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed && typeof parsed === "object" && parsed.repo) {
          setResult(parsed);
          setRepoUrl(parsed.repoUrl || parsed.repo || "");
        }
      }
    } catch (err) {
      console.warn("Corrupted analyzer cache detected and cleared.", err);
      localStorage.removeItem("talentTuner_lastAnalysis");
    }
  }, []);

  const handleAnalyze = async () => {
    if (!repoUrl) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await api.post(
        "/api/github/analyze",
        { repoUrl },
        { timeout: 60000 } // 60s timeout for heavy AI operations
      );
      // Attach original requested URL for caching
      const finalResult = { ...res.data, repoUrl };
      setResult(finalResult);
      
      // Cache safely to prevent accidental data loss on refresh
      localStorage.setItem("talentTuner_lastAnalysis", JSON.stringify(finalResult));
      setIsSaved(false); // Reset save state for new analysis
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please check the URL or try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!result) return;
    setSaveLoading(true);
    setSaveError("");
    
    try {
      // Intelligently aggregate AI-extracted skills for the Project techStack
      const aggregatedTech = [
        ...(result.languages || []),
        ...(result.frameworks || []),
        ...(result.skills || [])
      ];
      
      // Remove duplicates and join into a comma-separated string
      const uniqueTechString = [...new Set(aggregatedTech)].filter(Boolean).join(", ");
      
      const payload = {
        title: result.repo || "Analyzed Repository",
        githubUrl: result.repoUrl || `https://github.com/${result.repo}`,
        techStack: uniqueTechString || "Not specified",
        intelligenceScore: result.score || null,
        securityScore: result.security?.securityScore || null,
        complexity: result.aiReport?.complexity || null,
        aiSummary: result.aiReport?.summary || null,
        domains: result.domains && Array.isArray(result.domains) ? result.domains.join(", ") : ""
      };

      await api.post("/api/projects", payload);
      setIsSaved(true);
      // Removed alert, feedback is shown directly on the button UI
      
    } catch (err) {
      console.error("Failed to save project:", err);
      setSaveError(err.response?.data?.error || "Failed to save analysis to projects.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Styles
  const pageStyle = { minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0", fontFamily: "Inter, sans-serif" };
  const contentStyle = { padding: "40px", maxWidth: "1200px", margin: "0 auto" };
  const headerStyle = { textAlign: "center", marginBottom: "40px" };
  const inputContainerStyle = { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "40px" };
  const inputStyle = { padding: "14px 20px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff", outline: "none", width: "100%", maxWidth: "500px", fontSize: "16px" };
  const buttonStyle = { padding: "14px 24px", borderRadius: "8px", border: "none", backgroundColor: "#3b82f6", color: "#fff", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s", fontSize: "16px", whiteSpace: "nowrap" };
  const disabledButtonStyle = { ...buttonStyle, backgroundColor: "#1e3a8a", cursor: "not-allowed" };
  const errorStyle = { color: "#ef4444", textAlign: "center", marginBottom: "20px" };

  const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" };
  const cardStyle = { backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", display: "flex", flexDirection: "column" };
  const cardTitleStyle = { color: "#38bdf8", borderBottom: "1px solid #334155", paddingBottom: "10px", marginBottom: "15px", marginTop: "0", fontSize: "18px" };
  const scoreCardStyle = { ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gridColumn: "1 / -1", background: "linear-gradient(145deg, #1e293b, #0f172a)", border: "1px solid #3b82f6" };

  const pillStyle = { display: "inline-block", padding: "4px 10px", borderRadius: "9999px", backgroundColor: "#334155", color: "#cbd5e1", fontSize: "12px", marginRight: "6px", marginBottom: "6px", fontWeight: "500" };
  const alertPillStyle = { ...pillStyle, backgroundColor: "#7f1d1d", color: "#fca5a5" };
  
  const getScoreColor = (score) => score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div style={pageStyle}>
      <Navbar />
      <div style={contentStyle}>
        <div style={headerStyle}>
          <h1 style={{ fontSize: "36px", margin: "0 0 10px 0", color: "#f8fafc" }}>Developer Intelligence</h1>
          <p style={{ color: "#94a3b8", fontSize: "18px", margin: "0" }}>AI-Powered GitHub Repository Analysis</p>
        </div>

        <div style={inputContainerStyle}>
          <input
            type="text"
            placeholder="Paste GitHub Repo URL (e.g., https://github.com/facebook/react)"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            style={inputStyle}
          />
          <button style={loading ? disabledButtonStyle : buttonStyle} onClick={handleAnalyze} disabled={loading}>
            {loading ? "Processing..." : "Analyze Repo"}
          </button>
        </div>

        {error && <p style={errorStyle}>{error}</p>}

        {loading && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ display: "inline-block", width: "50px", height: "50px", border: "4px solid #334155", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "#38bdf8", marginTop: "20px", fontSize: "18px", fontWeight: "500" }}>Analyzing repository...</p>
            <p style={{ color: "#94a3b8" }}>Running AI and security analysis. This may take a minute.</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && result && (
          <div style={gridStyle}>
            {/* Score Banner */}
            <div style={scoreCardStyle}>
              <h2 style={{ color: "#94a3b8", margin: "0 0 10px 0", fontSize: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>Project Intelligence Score</h2>
              <div style={{ fontSize: "72px", fontWeight: "900", color: getScoreColor(result.score) }}>
                {result.score}<span style={{ fontSize: "24px", color: "#64748b" }}>/100</span>
              </div>
              
              {/* Intelligence Integration Button */}
              <button 
                onClick={handleSaveProject}
                disabled={isSaved || saveLoading}
                style={{ 
                  marginTop: "20px", 
                  padding: "12px 24px", 
                  borderRadius: "8px", 
                  border: "none", 
                  backgroundColor: isSaved ? "#064e3b" : "#8b5cf6", 
                  color: isSaved ? "#a7f3d0" : "#fff", 
                  fontWeight: "bold", 
                  cursor: isSaved || saveLoading ? "default" : "pointer", 
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: saveLoading ? 0.7 : 1
                }}
              >
                {saveLoading ? "Saving..." : isSaved ? "✅ Saved to Projects" : "📥 Save Intelligence to Projects"}
              </button>
              {saveError && <p style={{ color: "#ef4444", fontSize: "14px", marginTop: "10px", textAlign: "center" }}>{saveError}</p>}
            </div>

            {/* AI Summary */}
            <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <h3 style={cardTitleStyle}>AI Project Summary</h3>
              {result.aiReport ? (
                <>
                  <p style={{ color: "#e2e8f0", lineHeight: "1.6", marginBottom: "10px" }}><strong>Project Type:</strong> <span style={{...pillStyle, backgroundColor: "#4f46e5", color: "#e0e7ff"}}>{result.aiReport.projectType}</span></p>
                  <p style={{ color: "#cbd5e1", lineHeight: "1.6", backgroundColor: "#0f172a", padding: "20px", borderRadius: "8px", margin: "0", border: "1px solid #1e293b" }}>{result.aiReport.summary}</p>
                </>
              ) : (
                <p style={{ color: "#64748b" }}>No AI analysis available.</p>
              )}
            </div>

            {/* Overview */}
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>Repository Overview</h3>
              <p style={{ margin: "0 0 10px 0", color: "#e2e8f0" }}><strong>Repo:</strong> {result.repo}</p>
              <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <div style={{ backgroundColor: "#0f172a", padding: "10px", borderRadius: "8px", flex: 1, textAlign: "center", border: "1px solid #1e293b" }}>
                  <span style={{ display: "block", color: "#94a3b8", fontSize: "12px", textTransform: "uppercase" }}>Stars</span>
                  <span style={{ fontSize: "20px", fontWeight: "bold", color: "#f59e0b" }}>{result.stars}</span>
                </div>
                <div style={{ backgroundColor: "#0f172a", padding: "10px", borderRadius: "8px", flex: 1, textAlign: "center", border: "1px solid #1e293b" }}>
                  <span style={{ display: "block", color: "#94a3b8", fontSize: "12px", textTransform: "uppercase" }}>Forks</span>
                  <span style={{ fontSize: "20px", fontWeight: "bold", color: "#38bdf8" }}>{result.forks}</span>
                </div>
              </div>
              <p style={{ marginBottom: "8px", color: "#94a3b8", fontSize: "14px" }}>Languages:</p>
              <div>{result.languages?.length ? result.languages.map((lang, i) => <span key={i} style={pillStyle}>{lang}</span>) : <span style={{color: "#64748b"}}>None</span>}</div>
            </div>

            {/* Quality & Complexity */}
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>Code Quality & Structure</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #334155", paddingBottom: "8px" }}>
                  <span style={{ color: "#94a3b8" }}>Complexity</span>
                  <span style={{ fontWeight: "bold", color: "#e2e8f0" }}>{result.aiReport?.complexity || "Unknown"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #334155", paddingBottom: "8px" }}>
                  <span style={{ color: "#94a3b8" }}>Documentation</span>
                  <span style={{ fontWeight: "bold", color: "#e2e8f0" }}>{result.quality?.documentation || "N/A"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Structure</span>
                  <span style={{ fontWeight: "bold", color: "#e2e8f0" }}>{result.quality?.structure || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Skills & Frameworks */}
            <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <h3 style={cardTitleStyle}>Technical Profile</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                <div>
                  <p style={{ marginBottom: "8px", color: "#94a3b8", fontSize: "14px" }}>Frameworks & Tools:</p>
                  <div>
                    {result.frameworks?.length ? result.frameworks.map((f, i) => <span key={i} style={{...pillStyle, backgroundColor: "#1d4ed8", color: "#bfdbfe"}}>{f}</span>) : <span style={{color: "#64748b"}}>None detected</span>}
                  </div>
                </div>
                <div>
                  <p style={{ marginBottom: "8px", color: "#94a3b8", fontSize: "14px" }}>Extracted Skills:</p>
                  <div>
                    {result.skills?.length ? result.skills.map((s, i) => <span key={i} style={pillStyle}>{s}</span>) : <span style={{color: "#64748b"}}>None detected</span>}
                  </div>
                </div>
                <div>
                  <p style={{ marginBottom: "8px", color: "#94a3b8", fontSize: "14px" }}>Algorithms & Code Skills:</p>
                  <div>
                    {result.algorithms?.map((a, i) => <span key={`a-${i}`} style={{...pillStyle, backgroundColor: "#065f46", color: "#a7f3d0"}}>{a}</span>)}
                    {result.codeSkills?.map((s, i) => <span key={`s-${i}`} style={{...pillStyle, backgroundColor: "#065f46", color: "#a7f3d0"}}>{s}</span>)}
                    {!result.algorithms?.length && !result.codeSkills?.length && <span style={{color: "#64748b"}}>None detected</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Domains & Dependencies */}
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>Architecture Context</h3>
              <p style={{ marginBottom: "8px", color: "#94a3b8", fontSize: "14px" }}>Detected Domains:</p>
              <div style={{ marginBottom: "15px" }}>
                {result.domains?.length ? result.domains.map((d, i) => <span key={i} style={{...pillStyle, backgroundColor: "#8b5cf6", color: "#ede9fe"}}>{d}</span>) : <span style={{color: "#64748b"}}>None detected</span>}
              </div>
              
              <p style={{ marginBottom: "8px", color: "#94a3b8", fontSize: "14px" }}>Top Dependencies:</p>
              <div style={{ marginBottom: "15px" }}>
                {result.dependencies?.length ? result.dependencies.slice(0, 10).map((d, i) => <span key={i} style={{...pillStyle, backgroundColor: "#0f172a", border: "1px solid #334155"}}>{d}</span>) : <span style={{color: "#64748b"}}>None detected</span>}
                {result.dependencies?.length > 10 && <span style={{...pillStyle, backgroundColor: "transparent", color: "#94a3b8"}}>+{result.dependencies.length - 10} more</span>}
              </div>

              <p style={{ marginBottom: "8px", color: "#94a3b8", fontSize: "14px" }}>Key Files Analyzed:</p>
              <div>
                {result.files?.length ? result.files.slice(0, 5).map((f, i) => <span key={i} style={{...pillStyle, backgroundColor: "#0f172a", border: "1px solid #334155"}}>{f}</span>) : <span style={{color: "#64748b"}}>None detected</span>}
                {result.files?.length > 5 && <span style={{...pillStyle, backgroundColor: "transparent", color: "#94a3b8"}}>+{result.files.length - 5} more</span>}
              </div>
            </div>

            {/* Security Analysis */}
            <div style={cardStyle}>
              <h3 style={{ ...cardTitleStyle, color: "#f87171" }}>Security Analysis</h3>
              <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#0f172a", padding: "15px", borderRadius: "8px", border: "1px solid #334155" }}>
                <strong style={{ color: "#94a3b8" }}>Security Score:</strong>
                <span style={{ fontSize: "28px", fontWeight: "900", color: getScoreColor(result.security?.securityScore || 0) }}>
                  {result.security?.securityScore || 0}<span style={{fontSize: "16px", color: "#64748b"}}>/100</span>
                </span>
              </div>
              <p style={{ marginBottom: "8px", color: "#94a3b8", fontSize: "14px" }}>Risk Findings:</p>
              <div>
                {result.security?.findings?.length ? (
                  result.security.findings.map((f, i) => <div key={i} style={{...alertPillStyle, display: "block", marginBottom: "8px", padding: "10px 14px", borderRadius: "6px"}}>{f}</div>)
                ) : (
                  <div style={{color: "#10b981", backgroundColor: "#064e3b", padding: "10px 14px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "8px"}}>
                    <span style={{fontSize: "18px"}}>✅</span> No critical security risks detected
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights & Improvements */}
            <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <h3 style={{ ...cardTitleStyle, color: "#a78bfa" }}>AI Developer Insights</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                <div style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "8px", borderLeft: "4px solid #10b981" }}>
                  <p style={{ marginTop: "0", marginBottom: "15px", color: "#10b981", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>📈 Key Strengths</p>
                  <ul style={{ color: "#e2e8f0", paddingLeft: "20px", margin: "0", fontSize: "14px", lineHeight: "1.6" }}>
                    {result.aiReport?.strengths?.length ? result.aiReport.strengths.map((s, i) => <li key={i} style={{ marginBottom: "8px" }}>{s}</li>) : <li style={{color: "#64748b"}}>No specific strengths identified.</li>}
                  </ul>
                </div>
                
                <div style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "8px", borderLeft: "4px solid #fbbf24" }}>
                  <p style={{ marginTop: "0", marginBottom: "15px", color: "#fbbf24", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>💡 Suggested Improvements</p>
                  <ul style={{ color: "#e2e8f0", paddingLeft: "20px", margin: "0", fontSize: "14px", lineHeight: "1.6" }}>
                    {result.aiReport?.improvements?.length ? result.aiReport.improvements.map((s, i) => <li key={i} style={{ marginBottom: "8px" }}>{s}</li>) : <li style={{color: "#64748b"}}>No specific improvements suggested.</li>}
                  </ul>
                </div>
              </div>
              
              {result.aiReport?.skills?.length > 0 && (
                <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #334155" }}>
                  <p style={{ marginBottom: "10px", color: "#94a3b8", fontSize: "14px" }}>AI Detected Core Competencies:</p>
                  <div>
                    {result.aiReport.skills.map((s, i) => <span key={i} style={{...pillStyle, backgroundColor: "#4c1d95", color: "#ddd6fe", padding: "6px 14px"}}>{s}</span>)}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

export default Analyzer;