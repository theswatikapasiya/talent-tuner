import React, { useState, useEffect } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [socialLinks, setSocialLinks] = useState({ githubUrl: "", linkedinUrl: "", xUrl: "" });
  const [profileData, setProfileData] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/profile");
        if (res.data && res.data.profileData) {
          setProfileData(res.data.profileData);
          setSocialLinks(res.data.socialLinks);
          if (res.data.profileData.resumeUrl) {
            setResumePreviewUrl(res.data.profileData.resumeUrl);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      
      const formData = new FormData();
      formData.append("resume", file);
      
      try {
        const res = await api.post("/api/profile/upload-resume", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setResumePreviewUrl(res.data.resumeUrl);
      } catch (err) {
        console.error(err);
        alert("Failed to securely upload resume to the vault.");
      }
    } else {
      alert("Please upload a valid PDF resume.");
    }
  };

  const handleScanProfile = async (e) => {
    e.preventDefault();
    if (!socialLinks.githubUrl && !socialLinks.linkedinUrl) {
      return alert("Please provide at least a GitHub or LinkedIn URL to scan.");
    }
    setLoading(true);
    try {
      const res = await api.post("/api/profile/analyze", socialLinks);
      setProfileData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze profile.");
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: "transparent", minHeight: "100vh", color: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "40px 20px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid #1e293b", paddingBottom: "20px", marginBottom: "30px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "36px", fontWeight: "800", color: "#f8fafc" }}>User Command Center</h1>
            <p style={{ color: "#94a3b8", margin: "5px 0 0 0", fontSize: "16px" }}>Manage your identity, resume, and security authenticity reports.</p>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "30px", alignItems: "start" }}>
          
          {/* COLUMN 1: SOCIAL LINKS & SCRAPED PROFILE */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ backgroundColor: "#0f172a", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b" }}>
              <h2 style={{ margin: "0 0 15px 0", fontSize: "20px", color: "#38bdf8", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🔗</span> Link Social Profiles
              </h2>
              <form onSubmit={handleScanProfile} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "5px" }}>GitHub Profile URL</label>
                  <input type="url" placeholder="https://github.com/username" value={socialLinks.githubUrl} onChange={e => setSocialLinks({...socialLinks, githubUrl: e.target.value})} style={{ width: "100%", padding: "10px", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: "#fff", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "5px" }}>LinkedIn Profile URL</label>
                  <input type="url" placeholder="https://linkedin.com/in/username" value={socialLinks.linkedinUrl} onChange={e => setSocialLinks({...socialLinks, linkedinUrl: e.target.value})} style={{ width: "100%", padding: "10px", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: "#fff", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "5px" }}>X (Twitter) URL</label>
                  <input type="url" placeholder="https://x.com/username" value={socialLinks.xUrl} onChange={e => setSocialLinks({...socialLinks, xUrl: e.target.value})} style={{ width: "100%", padding: "10px", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "6px", color: "#fff", boxSizing: "border-box" }} />
                </div>
                <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Scanning Web..." : "Run Security Scan & Scrape"}
                </button>
              </form>
            </div>

            {profileData && profileData.scrapedInfo && (
              <div style={{ backgroundColor: "#0f172a", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b" }}>
                <h2 style={{ margin: "0 0 15px 0", fontSize: "20px", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>👤</span> Scraped Identity
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: "#cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e293b", paddingBottom: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Name</span>
                    <span style={{ fontWeight: "600", color: "#f8fafc" }}>{profileData.scrapedInfo.name}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e293b", paddingBottom: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Email</span>
                    <span>{profileData.scrapedInfo.email}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e293b", paddingBottom: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Occupation</span>
                    <span>{profileData.scrapedInfo.occupation}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Public Repositories</span>
                    <span style={{ color: "#10b981", fontWeight: "bold" }}>{profileData.scrapedInfo.reposCount}</span>
                  </div>
                </div>
                
                <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                  {socialLinks.linkedinUrl && <a href={socialLinks.linkedinUrl} target="_blank" rel="noreferrer" style={{ padding: "8px 12px", backgroundColor: "#0a66c2", color: "#fff", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", textAlign: "center", flex: 1 }}>LinkedIn</a>}
                  {socialLinks.githubUrl && <a href={socialLinks.githubUrl} target="_blank" rel="noreferrer" style={{ padding: "8px 12px", backgroundColor: "#333", color: "#fff", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", textAlign: "center", flex: 1 }}>GitHub</a>}
                  {socialLinks.xUrl && <a href={socialLinks.xUrl} target="_blank" rel="noreferrer" style={{ padding: "8px 12px", backgroundColor: "#000", color: "#fff", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", textAlign: "center", flex: 1 }}>X Profile</a>}
                </div>
              </div>
            )}
          </div>


          {/* COLUMN 2: RESUME VIEWER & PROJECTS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            
            <div style={{ backgroundColor: "#0f172a", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, fontSize: "20px", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📄</span> Official Resume
                </h2>
                {!resumePreviewUrl && (
                  <label style={{ padding: "8px 16px", backgroundColor: "#3b82f6", color: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
                    Upload PDF Resume
                    <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleResumeUpload} />
                  </label>
                )}
              </div>

              {resumePreviewUrl ? (
                <div style={{ width: "100%", height: "650px", borderRadius: "8px", overflow: "hidden", border: "1px solid #334155" }}>
                  <object data={resumePreviewUrl} type="application/pdf" width="100%" height="100%">
                    <p style={{ padding: "20px", textAlign: "center" }}>It appears your browser doesn't support embedded PDFs. <a href={resumePreviewUrl} target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>Download it here</a>.</p>
                  </object>
                </div>
              ) : (
                <div style={{ width: "100%", height: "650px", backgroundColor: "#1e293b", borderRadius: "8px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "2px dashed #334155" }}>
                  <span style={{ fontSize: "40px", marginBottom: "15px" }}>📁</span>
                  <h3 style={{ color: "#94a3b8", margin: "0 0 10px 0" }}>No Resume Uploaded</h3>
                  <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>Upload a PDF to view it in full format here.</p>
                </div>
              )}
            </div>

            <div style={{ backgroundColor: "#0f172a", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b" }}>
              <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", color: "#f8fafc" }}>Detailed GitHub Repository Analyzer</h2>
              
              {!profileData || !profileData.projectsAnalysis || profileData.projectsAnalysis.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px dashed #334155" }}>
                  <span style={{ fontSize: "30px", display: "block", marginBottom: "10px" }}>💻</span>
                  <p style={{ color: "#94a3b8", margin: 0 }}>Waiting for GitHub profile URL scan to begin repository authenticity analysis.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {profileData.projectsAnalysis.map((repo, i) => (
                    <div key={i} style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "8px", borderLeft: `4px solid ${repo.authenticityScore > 80 ? '#10b981' : '#f59e0b'}`, display: "flex", flexDirection: "column", gap: "15px" }}>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <a href={repo.url} target="_blank" rel="noreferrer" style={{ color: "#38bdf8", fontWeight: "bold", textDecoration: "none", fontSize: "18px" }}>{repo.name} ↗</a>
                          <span style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Primary Language: {repo.language}</span>
                        </div>
                        <span style={{ backgroundColor: repo.authenticityScore > 80 ? '#064e3b' : '#78350f', color: repo.authenticityScore > 80 ? '#10b981' : '#fbbf24', padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                          Auth Score: {repo.authenticityScore}%
                        </span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "5px" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                            <span style={{ color: "#cbd5e1" }}>Security Integrity</span>
                            <span style={{ color: repo.securityScore > 70 ? "#10b981" : "#ef4444" }}>{repo.securityScore}%</span>
                          </div>
                          <div style={{ width: "100%", height: "6px", backgroundColor: "#334155", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${repo.securityScore}%`, height: "100%", backgroundColor: repo.securityScore > 70 ? "#10b981" : "#ef4444" }}></div>
                          </div>
                        </div>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                            <span style={{ color: "#cbd5e1" }}>Code Quality</span>
                            <span style={{ color: repo.codeQualityScore > 70 ? "#38bdf8" : "#f59e0b" }}>{repo.codeQualityScore}%</span>
                          </div>
                          <div style={{ width: "100%", height: "6px", backgroundColor: "#334155", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${repo.codeQualityScore}%`, height: "100%", backgroundColor: repo.codeQualityScore > 70 ? "#38bdf8" : "#f59e0b" }}></div>
                          </div>
                        </div>
                      </div>

                      <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "6px", border: "1px solid #334155" }}>
                        <p style={{ color: "#f8fafc", margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600" }}>Analyst Notes:</p>
                        <p style={{ color: "#cbd5e1", margin: "0 0 10px 0", fontSize: "14px", lineHeight: "1.5" }}>{repo.securityNotes}</p>
                        
                        {repo.improvementSuggestions && repo.improvementSuggestions.length > 0 && (
                          <>
                            <p style={{ color: "#f87171", margin: "0 0 5px 0", fontSize: "13px", fontWeight: "600" }}>Suggested Improvements:</p>
                            <ul style={{ margin: 0, paddingLeft: "15px", color: "#94a3b8", fontSize: "13px" }}>
                              {repo.improvementSuggestions.map((sug, j) => <li key={j} style={{ marginBottom: "4px" }}>{sug}</li>)}
                            </ul>
                          </>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>


          {/* COLUMN 3: SECURITY REPORT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ backgroundColor: "#0f172a", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b", position: "sticky", top: "20px" }}>
              <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", color: "#f87171", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🛡️</span> Security Analyst Report
              </h2>
              
              {!profileData ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                  <span style={{ fontSize: "30px", display: "block", marginBottom: "10px" }}>🔍</span>
                  <p style={{ margin: 0, fontSize: "14px" }}>Awaiting social profiles to run cyber security authenticity scan...</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#1e293b", borderRadius: "8px", border: `1px solid ${profileData.securityReport.overallAuthenticity > 80 ? '#10b981' : '#f59e0b'}` }}>
                    <span style={{ fontSize: "36px", fontWeight: "900", color: profileData.securityReport.overallAuthenticity > 80 ? '#10b981' : '#f59e0b', display: "block" }}>
                      {profileData.securityReport.overallAuthenticity}%
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "1px" }}>Overall Authenticity</span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: "14px", color: "#e2e8f0", margin: "0 0 10px 0", textTransform: "uppercase" }}>Identity Verification</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#1e293b", padding: "12px", borderRadius: "6px", marginBottom: "8px" }}>
                      <span style={{ color: "#cbd5e1" }}>LinkedIn Genuine:</span>
                      <span style={{ color: profileData.securityReport.linkedinGenuine ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                        {profileData.securityReport.linkedinGenuine ? "PASSED" : "FAILED / UNKNOWN"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#1e293b", padding: "12px", borderRadius: "6px" }}>
                      <span style={{ color: "#cbd5e1" }}>GitHub Genuine:</span>
                      <span style={{ color: profileData.securityReport.githubGenuine ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                        {profileData.securityReport.githubGenuine ? "PASSED" : "FAILED"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: "14px", color: "#e2e8f0", margin: "0 0 10px 0", textTransform: "uppercase" }}>AI Plagiarism & Code Scan</h3>
                    <div style={{ backgroundColor: "#1e293b", padding: "15px", borderRadius: "6px", borderLeft: "3px solid #8b5cf6" }}>
                      <p style={{ margin: 0, color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                        {profileData.securityReport.plagReport}
                      </p>
                    </div>
                  </div>
                  
                  <button onClick={() => window.print()} style={{ marginTop: "10px", width: "100%", padding: "12px", backgroundColor: "transparent", color: "#38bdf8", border: "1px solid #38bdf8", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                    Export Security Report
                  </button>

                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}