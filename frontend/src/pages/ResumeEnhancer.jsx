import React, { useState } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";

// Predefined Categories and Roles
const jobCategories = {
  "Software Engineering": ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer"],
  "Data Science & AI": ["Data Scientist", "Machine Learning Engineer", "Data Analyst", "AI Engineer"],
  "Cloud & DevOps": ["DevOps Engineer", "Cloud Architect", "Site Reliability Engineer"],
  "Cybersecurity": ["Security Analyst", "Penetration Tester", "Security Engineer"],
  "Product & Design": ["Product Manager", "UX/UI Designer", "Product Designer"]
};

function ResumeEnhancer() {
  const [category, setCategory] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!category || !role || !resumeFile) {
      setError("Please select a category, role, and upload your resume.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("category", category);
    formData.append("role", role);
    formData.append("description", description);
    formData.append("resume", resumeFile);

    try {
      const res = await api.post("/api/resume/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        timeout: 120000 // 2 minutes timeout
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Styles
  const pageStyle = { minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0", fontFamily: "Inter, sans-serif" };
  const contentStyle = { padding: "40px", maxWidth: "1200px", margin: "0 auto" };
  const headerStyle = { textAlign: "center", marginBottom: "40px" };
  const formCardStyle = { backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", border: "1px solid #334155", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "40px" };
  const formGroupStyle = { marginBottom: "20px" };
  const labelStyle = { display: "block", marginBottom: "8px", color: "#94a3b8", fontWeight: "500" };
  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", outline: "none", fontSize: "16px", boxSizing: "border-box" };
  const textareaStyle = { ...inputStyle, minHeight: "100px", resize: "vertical" };
  const fileInputStyle = { ...inputStyle, padding: "10px", cursor: "pointer" };
  
  const buttonStyle = { padding: "14px 24px", borderRadius: "8px", border: "none", backgroundColor: "#8b5cf6", color: "#fff", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s", fontSize: "16px", width: "100%" };
  const disabledButtonStyle = { ...buttonStyle, backgroundColor: "#4c1d95", cursor: "not-allowed" };
  const downloadButtonStyle = { ...buttonStyle, backgroundColor: "#10b981", width: "auto", display: "flex", alignItems: "center", gap: "8px", margin: "30px auto 0" };
  
  const errorStyle = { color: "#ef4444", textAlign: "center", marginBottom: "20px", backgroundColor: "#7f1d1d20", padding: "10px", borderRadius: "8px" };

  const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "30px" };
  const cardStyle = { backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" };
  const cardTitleStyle = { color: "#38bdf8", borderBottom: "1px solid #334155", paddingBottom: "10px", marginBottom: "15px", marginTop: "0", fontSize: "18px" };
  
  const getScoreColor = (score) => score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  const renderProgressBar = (label, score) => (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontWeight: "bold", color: "#e2e8f0" }}>{label}</span>
        <span style={{ fontWeight: "900", color: getScoreColor(score) }}>{score}%</span>
      </div>
      <div style={{ width: "100%", height: "12px", backgroundColor: "#0f172a", borderRadius: "6px", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", backgroundColor: getScoreColor(score), borderRadius: "6px", transition: "width 1s ease-in-out" }} />
      </div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <div className="no-print"><Navbar /></div>
      <div style={contentStyle} className="print-content">
        <div style={headerStyle}>
          <h1 style={{ fontSize: "36px", margin: "0 0 10px 0", color: "#f8fafc", background: "linear-gradient(to right, #8b5cf6, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Resume Enhancer</h1>
          <p style={{ color: "#94a3b8", fontSize: "18px", margin: "0" }} className="no-print">Optimize your resume for ATS and get hired faster.</p>
        </div>

        <div className="no-print">
          <div style={formCardStyle}>
            {error && <div style={errorStyle}>{error}</div>}
            
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 300px", ...formGroupStyle }}>
                <label style={labelStyle}>Job Category</label>
                <select style={inputStyle} value={category} onChange={(e) => { setCategory(e.target.value); setRole(""); }}>
                  <option value="">Select a Category</option>
                  {Object.keys(jobCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ flex: "1 1 300px", ...formGroupStyle }}>
                <label style={labelStyle}>Specific Role</label>
                <select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)} disabled={!category}>
                  <option value="">Select a Role</option>
                  {category && jobCategories[category].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Job Description (Optional)</label>
              <textarea 
                style={textareaStyle} 
                placeholder="Paste the job description here to tailor your analysis..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Upload Resume (PDF)</label>
              <input 
                type="file" 
                accept=".pdf"
                style={fileInputStyle}
                onChange={handleFileChange}
              />
            </div>

            <button style={loading ? disabledButtonStyle : buttonStyle} onClick={handleAnalyze} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <div style={{ width: "20px", height: "20px", border: "3px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  Analyzing Resume...
                </span>
              ) : "Analyze & Enhance Resume"}
            </button>
            <style>{`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              @media print {
                body { background: white !important; color: black !important; }
                .no-print { display: none !important; }
                .print-content { padding: 0 !important; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              }
            `}</style>
          </div>
        </div>

        {result && result.analysis && (
          <div id="report-section">
            <div style={{ ...cardStyle, marginBottom: "30px", background: "linear-gradient(145deg, #1e293b, #0f172a)", border: "1px solid #8b5cf6" }}>
              <h2 style={{ color: "#f8fafc", textAlign: "center", marginBottom: "30px", fontSize: "28px" }}>Resume Analysis Report</h2>
              <div style={{ display: "flex", flexDirection: "row", gap: "40px", flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ flex: "1 1 300px", maxWidth: "400px" }}>
                  {renderProgressBar("ATS Compatibility Score", result.analysis.atsScore)}
                  {renderProgressBar("Probability of Hiring", result.analysis.hiringProbability)}
                </div>
              </div>
            </div>

            <div style={gridStyle}>
              {/* Detailed Feedback */}
              <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
                <h3 style={cardTitleStyle}>Detailed Feedback</h3>
                <ul style={{ paddingLeft: "20px", lineHeight: "1.8", color: "#cbd5e1" }}>
                  {result.analysis.detailedFeedback?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: "10px" }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Line by Line Analysis */}
              <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
                <h3 style={cardTitleStyle}>Line-by-Line Review</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {result.analysis.lineByLineAnalysis?.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: "#0f172a", padding: "15px", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
                      <strong style={{ color: "#38bdf8", display: "block", marginBottom: "5px" }}>{item.section}</strong>
                      <span style={{ color: "#e2e8f0" }}>{item.comment}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div style={cardStyle}>
                <h3 style={{ ...cardTitleStyle, color: "#fbbf24", borderBottomColor: "#fbbf2450" }}>Suggested Improvements</h3>
                <ul style={{ paddingLeft: "20px", lineHeight: "1.8", color: "#cbd5e1" }}>
                  {result.analysis.improvements?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: "10px" }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Project Updates */}
              <div style={cardStyle}>
                <h3 style={{ ...cardTitleStyle, color: "#10b981", borderBottomColor: "#10b98150" }}>Project Updates & Additions</h3>
                <ul style={{ paddingLeft: "20px", lineHeight: "1.8", color: "#cbd5e1" }}>
                  {result.analysis.projectUpdates?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: "10px" }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* YouTube Pro Tips */}
            {result.videos && result.videos.length > 0 && (
              <div style={{ ...cardStyle, marginTop: "30px" }} className="no-print">
                <h3 style={{ ...cardTitleStyle, color: "#ef4444", borderBottomColor: "#ef444450" }}>Interview & Resume Pro Tips</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                  {result.videos.map((vid, idx) => (
                    <a href={vid.url} target="_blank" rel="noopener noreferrer" key={idx} style={{ textDecoration: "none", color: "inherit", display: "block", backgroundColor: "#0f172a", borderRadius: "8px", overflow: "hidden", border: "1px solid #334155", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                      <img src={vid.thumbnail} alt={vid.title} style={{ width: "100%", height: "150px", objectFit: "cover" }} />
                      <div style={{ padding: "15px" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#f8fafc", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{vid.title}</h4>
                        <span style={{ color: "#ef4444", fontSize: "12px", fontWeight: "bold" }}>Watch Video ▶</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handlePrint} style={downloadButtonStyle} className="no-print">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeEnhancer;
