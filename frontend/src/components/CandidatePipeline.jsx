import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { calculateJobCompatibility } from "../utils/jobMatcher";

function CandidatePipeline({ job, onBack }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAndRankCandidates = async () => {
      try {
        const res = await api.get("/api/recruiters/candidates");
        const rawCandidates = res.data;

        // Deterministically rank candidates based on extracted intelligence
        const ranked = rawCandidates
          .map(candidate => {
            // A developer must have projects to be ranked
            if (!candidate.projects || candidate.projects.length === 0) {
              return null;
            }

            const compatibility = calculateJobCompatibility(candidate.projects, job.requiredSkills);
            
            // Extract strongest domains/tech statically for now
            const strongestTech = compatibility.matched.slice(0, 3);
            
            return {
              ...candidate,
              compatibility,
              strongestTech
            };
          })
          .filter(Boolean) // Remove incomplete profiles
          .sort((a, b) => b.compatibility.score - a.compatibility.score);

        setCandidates(ranked);
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
        setError("Could not safely fetch candidate intelligence.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndRankCandidates();
  }, [job]);

  const pillStyle = { display: "inline-block", padding: "4px 10px", borderRadius: "9999px", backgroundColor: "#334155", color: "#cbd5e1", fontSize: "12px", fontWeight: "500", marginRight: "6px", marginBottom: "6px" };
  const cardStyle = { backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155", display: "flex", flexDirection: "column", gap: "15px" };
  const matchPill = { ...pillStyle, backgroundColor: "#064e3b", color: "#34d399", border: "1px solid #059669" };

  return (
    <div>
      <button 
        onClick={onBack}
        style={{ backgroundColor: "transparent", color: "#94a3b8", border: "none", cursor: "pointer", fontSize: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "5px" }}
      >
        ← Back to Intelligence Pipelines
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px", borderBottom: "1px solid #1e293b", paddingBottom: "20px" }}>
        <div>
          <div style={{ color: "#38bdf8", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "5px" }}>Active Pipeline</div>
          <h2 style={{ fontSize: "28px", color: "#f8fafc", margin: "0 0 10px 0" }}>{job.title}</h2>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {job.requiredSkills.map((skill, i) => <span key={i} style={pillStyle}>{skill}</span>)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "36px", fontWeight: "900", color: "#f8fafc" }}>{candidates.length}</div>
          <div style={{ color: "#94a3b8", fontSize: "14px", textTransform: "uppercase" }}>Verified Candidates</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Aggregating candidate intelligence...</div>
      ) : error ? (
        <div style={{ backgroundColor: "#450a0a", color: "#fca5a5", padding: "15px", borderRadius: "8px", border: "1px solid #7f1d1d" }}>{error}</div>
      ) : candidates.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "60px 20px", border: "1px dashed #475569" }}>
          <div style={{ fontSize: "40px", marginBottom: "15px" }}>🕵️‍♂️</div>
          <h3 style={{ fontSize: "20px", color: "#f8fafc", margin: "0 0 10px 0" }}>No Compatible Candidates Found</h3>
          <p style={{ color: "#94a3b8", maxWidth: "500px", margin: "0 auto" }}>
            Developers must save analyzed repositories to appear in recruiter pipelines. Wait for the intelligence ecosystem to aggregate more profiles.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "24px" }}>
          {candidates.map(candidate => (
            <div key={candidate.id} style={cardStyle}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ color: "#f8fafc", fontSize: "20px", margin: "0 0 5px 0" }}>{candidate.name}</h3>
                  <div style={{ color: "#94a3b8", fontSize: "14px" }}>Verified Developer Intelligence</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "28px", fontWeight: "900", color: candidate.compatibility.score >= 80 ? "#10b981" : candidate.compatibility.score >= 50 ? "#f59e0b" : "#ef4444" }}>
                    {candidate.compatibility.score}%
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>Deterministic Match</div>
                </div>
              </div>

              <div style={{ backgroundColor: "#0f172a", padding: "15px", borderRadius: "8px", border: "1px solid #1e293b" }}>
                <div style={{ color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>Match Reasoning</div>
                <p style={{ color: "#e2e8f0", fontSize: "14px", margin: "0 0 10px 0", lineHeight: "1.5" }}>
                  {candidate.compatibility.recommendations[0] || "Compatibility verified through code overlap."}
                </p>
                {candidate.compatibility.matched.length > 0 && (
                  <div>
                    <span style={{ fontSize: "12px", color: "#94a3b8", marginRight: "8px" }}>Verified Skills:</span>
                    {candidate.compatibility.matched.slice(0, 5).map((s, i) => <span key={i} style={matchPill}>{s}</span>)}
                  </div>
                )}
              </div>

              <div>
                <div style={{ color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>Repository Intelligence ({candidate.projects.length} Saved)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {candidate.projects.slice(0, 2).map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", padding: "8px 12px", borderRadius: "6px" }}>
                      <span style={{ color: "#38bdf8", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>{p.title}</span>
                      <span style={{ color: "#64748b", fontSize: "12px" }}>Score: {p.score || "N/A"}</span>
                    </div>
                  ))}
                  {candidate.projects.length > 2 && <div style={{ fontSize: "12px", color: "#64748b", textAlign: "center" }}>+{candidate.projects.length - 2} more verified repositories</div>}
                </div>
              </div>
              
              {/* AI-Derived Intelligence Fields */}
              <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                <div style={{ flex: 1, textAlign: "center", backgroundColor: "#0f172a", padding: "10px", borderRadius: "6px", border: "1px solid #334155" }}>
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>AI-Derived Security Score</div>
                  <div style={{ color: candidate.projects[0]?.securityScore >= 80 ? "#10b981" : candidate.projects[0]?.securityScore ? "#f59e0b" : "#94a3b8", fontSize: "16px", fontWeight: "bold" }}>
                    {candidate.projects[0]?.securityScore ? `${candidate.projects[0].securityScore}/100` : "N/A"}
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center", backgroundColor: "#0f172a", padding: "10px", borderRadius: "6px", border: "1px solid #334155" }}>
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Estimated Complexity</div>
                  <div style={{ color: "#38bdf8", fontSize: "16px", fontWeight: "bold" }}>
                    {candidate.projects[0]?.complexity || "N/A"}
                  </div>
                </div>
              </div>
              
              {candidate.projects[0]?.aiSummary && (
                <div style={{ marginTop: "10px", backgroundColor: "#0f172a", padding: "12px", borderRadius: "6px", borderLeft: "3px solid #8b5cf6" }}>
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>AI Technical Summary</div>
                  <p style={{ margin: "0", color: "#cbd5e1", fontSize: "12px", lineHeight: "1.5" }}>
                    {candidate.projects[0].aiSummary}
                  </p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CandidatePipeline;
