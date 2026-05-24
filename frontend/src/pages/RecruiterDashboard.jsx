import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState("welcome"); // "welcome", "intelligence", "assessments", "jobs", "overview"
  
  // Overview state
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [description, setDescription] = useState("");
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Intelligence state
  const [intelligenceDomain, setIntelligenceDomain] = useState("Software Engineering");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Assessments state
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Project");
  const [assessmentDomain, setAssessmentDomain] = useState("Full Stack Development");
  const [problemStatement, setProblemStatement] = useState("");
  const [creatingAssessment, setCreatingAssessment] = useState(false);

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobDomain, setJobDomain] = useState("Software Engineering");
  const [jobLocation, setJobLocation] = useState("");
  const [jobExp, setJobExp] = useState("Entry Level");
  const [jobSalary, setJobSalary] = useState("$50k - $100k");
  const [jobType, setJobType] = useState("Full-time");
  const [jobSkills, setJobSkills] = useState("");
  const [creatingJob, setCreatingJob] = useState(false);

  // Candidate viewer
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Styles
  const pageStyle = { minHeight: "100vh", backgroundColor: "transparent", color: "#e2e8f0", fontFamily: "Inter, sans-serif" };
  const contentStyle = { padding: "40px", maxWidth: "1200px", margin: "0 auto" };
  const cardStyle = { backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155", marginBottom: "30px" };
  const inputStyle = { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", marginBottom: "15px", boxSizing: "border-box" };
  const tabBtnStyle = (active) => ({ padding: "12px 24px", fontSize: "16px", fontWeight: "bold", border: "none", backgroundColor: active ? "#38bdf8" : "#1e293b", color: active ? "#0f172a" : "#94a3b8", cursor: "pointer", borderRadius: "8px 8px 0 0" });

  useEffect(() => {
    if (activeTab === "overview") fetchProfile();
    if (activeTab === "assessments") fetchAssessments();
    if (activeTab === "jobs") fetchJobs();
    if (activeTab === "intelligence") fetchLeaderboard();
  }, [activeTab, intelligenceDomain]);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await api.get("/api/recruiters/profile");
      setProfileData(res.data);
      const prof = res.data.profile;
      setCompanyName(prof.companyName || "");
      setLocation(prof.location || "");
      setWebsite(prof.website || "");
      setLinkedin(prof.linkedinUrl || "");
      setXUrl(prof.xUrl || "");
      setDescription(prof.description || "");
      setNotificationsOn(prof.notificationsOn ?? true);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
    setLoadingProfile(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.post("/api/recruiters/profile", {
        companyName,
        location,
        website,
        linkedinUrl: linkedin,
        xUrl,
        description,
        notificationsOn
      });
      setEditingProfile(false);
      fetchProfile();
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
    }
    setSavingProfile(false);
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await api.get(`/api/recruiters/intelligence/${encodeURIComponent(intelligenceDomain)}`);
      setLeaderboard(res.data);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
    setLoadingLeaderboard(false);
  };

  const fetchAssessments = async () => {
    setLoadingAssessments(true);
    try {
      const res = await api.get("/api/assessments/recruiter");
      setAssessments(res.data);
    } catch (err) {
      console.error("Failed to fetch assessments", err);
    }
    setLoadingAssessments(false);
  };

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await api.get("/api/jobs/recruiter");
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
    setLoadingJobs(false);
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    setCreatingAssessment(true);
    try {
      await api.post("/api/assessments/create", { title, type, domain: assessmentDomain, problemStatement });
      setTitle(""); setProblemStatement("");
      fetchAssessments();
      alert("Assessment deployed!");
    } catch (err) { alert("Failed to deploy assessment."); }
    setCreatingAssessment(false);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setCreatingJob(true);
    try {
      const skillsArray = jobSkills.split(",").map(s => s.trim()).filter(Boolean);
      await api.post("/api/jobs", {
        title: jobTitle,
        description: jobDesc,
        domain: jobDomain,
        location: jobLocation,
        experienceLevel: jobExp,
        salaryRange: jobSalary,
        jobType: jobType,
        requiredSkills: skillsArray
      });
      setJobTitle(""); setJobDesc(""); setJobLocation(""); setJobSkills("");
      fetchJobs();
      alert("Job posted to the network!");
    } catch (err) { alert("Failed to post job."); }
    setCreatingJob(false);
  };

  const renderCandidateViewer = () => {
    if (!selectedCandidate) return null;
    const { profile, testResults } = selectedCandidate;
    
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ backgroundColor: "#020617", width: "100%", maxWidth: "1600px", height: "95vh", borderRadius: "12px", border: "1px solid #38bdf8", display: "flex", flexDirection: "column", overflow: "hidden", color: "#f8fafc" }}>
          
          <div style={{ padding: "20px 40px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a" }}>
            <div>
              <h2 style={{ margin: 0, color: "#f8fafc", fontSize: "32px", fontWeight: "800" }}>{selectedCandidate.name}'s Profile</h2>
              <p style={{ margin: 0, color: "#94a3b8" }}>{selectedCandidate.email}</p>
            </div>
            <button onClick={() => setSelectedCandidate(null)} style={{ background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Close Viewer</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "40px", display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "30px", alignItems: "start" }}>
            
            {/* COLUMN 1: SOCIAL LINKS & SCRAPED PROFILE */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ backgroundColor: "#0f172a", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b" }}>
                <h2 style={{ margin: "0 0 15px 0", fontSize: "20px", color: "#38bdf8", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🔗</span> Linked Social Profiles
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: "#cbd5e1", fontSize: "14px", wordBreak: "break-all" }}>
                  {profile?.githubUrl && <div><strong>GitHub:</strong> <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{color:"#38bdf8"}}>{profile.githubUrl}</a></div>}
                  {profile?.linkedinUrl && <div><strong>LinkedIn:</strong> <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{color:"#38bdf8"}}>{profile.linkedinUrl}</a></div>}
                  {profile?.xUrl && <div><strong>X:</strong> <a href={profile.xUrl} target="_blank" rel="noreferrer" style={{color:"#38bdf8"}}>{profile.xUrl}</a></div>}
                  {(!profile?.githubUrl && !profile?.linkedinUrl) && <div style={{ color: "#94a3b8" }}>No social links provided.</div>}
                </div>
              </div>

              {profile?.scrapedInfo && (
                <div style={{ backgroundColor: "#0f172a", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b" }}>
                  <h2 style={{ margin: "0 0 15px 0", fontSize: "20px", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>👤</span> Scraped Identity
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: "#cbd5e1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e293b", paddingBottom: "8px" }}>
                      <span style={{ color: "#94a3b8" }}>Name</span>
                      <span style={{ fontWeight: "600", color: "#f8fafc" }}>{profile.scrapedInfo.name}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e293b", paddingBottom: "8px" }}>
                      <span style={{ color: "#94a3b8" }}>Occupation</span>
                      <span>{profile.scrapedInfo.occupation}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>Public Repositories</span>
                      <span style={{ color: "#10b981", fontWeight: "bold" }}>{profile.scrapedInfo.reposCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* COLUMN 2: RESUME VIEWER & PROJECTS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              <div style={{ backgroundColor: "#0f172a", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b" }}>
                <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📄</span> Official Resume
                </h2>
                {profile?.resumeUrl ? (
                  <div style={{ width: "100%", height: "650px", borderRadius: "8px", overflow: "hidden", border: "1px solid #334155" }}>
                    <object data={profile.resumeUrl} type="application/pdf" width="100%" height="100%">
                      <p style={{ padding: "20px", textAlign: "center" }}>It appears your browser doesn't support embedded PDFs. <a href={profile.resumeUrl} target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>Download it here</a>.</p>
                    </object>
                  </div>
                ) : (
                  <div style={{ width: "100%", height: "650px", backgroundColor: "#1e293b", borderRadius: "8px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "2px dashed #334155" }}>
                    <span style={{ fontSize: "40px", marginBottom: "15px" }}>📁</span>
                    <h3 style={{ color: "#94a3b8", margin: "0 0 10px 0" }}>No Resume Uploaded</h3>
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: "#0f172a", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b" }}>
                <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", color: "#f8fafc" }}>Detailed GitHub Repository Analyzer</h2>
                {!profile?.projectsAnalysis || profile.projectsAnalysis.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px dashed #334155" }}>
                    <span style={{ fontSize: "30px", display: "block", marginBottom: "10px" }}>💻</span>
                    <p style={{ color: "#94a3b8", margin: 0 }}>No repository analysis available.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {profile.projectsAnalysis.map((repo, i) => (
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
                {!profile?.securityReport ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                    <span style={{ fontSize: "30px", display: "block", marginBottom: "10px" }}>🔍</span>
                    <p style={{ margin: 0, fontSize: "14px" }}>No Security Report Available</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#1e293b", borderRadius: "8px", border: `1px solid ${profile.securityReport.overallAuthenticity > 80 ? '#10b981' : '#f59e0b'}` }}>
                      <span style={{ fontSize: "36px", fontWeight: "900", color: profile.securityReport.overallAuthenticity > 80 ? '#10b981' : '#f59e0b', display: "block" }}>
                        {profile.securityReport.overallAuthenticity}%
                      </span>
                      <span style={{ color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "1px" }}>Overall Authenticity</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: "14px", color: "#e2e8f0", margin: "0 0 10px 0", textTransform: "uppercase" }}>Identity Verification</h3>
                      <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#1e293b", padding: "12px", borderRadius: "6px", marginBottom: "8px" }}>
                        <span style={{ color: "#cbd5e1" }}>LinkedIn Genuine:</span>
                        <span style={{ color: profile.securityReport.linkedinGenuine ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                          {profile.securityReport.linkedinGenuine ? "PASSED" : "FAILED / UNKNOWN"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#1e293b", padding: "12px", borderRadius: "6px" }}>
                        <span style={{ color: "#cbd5e1" }}>GitHub Genuine:</span>
                        <span style={{ color: profile.securityReport.githubGenuine ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                          {profile.securityReport.githubGenuine ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: "14px", color: "#e2e8f0", margin: "0 0 10px 0", textTransform: "uppercase" }}>AI Plagiarism & Code Scan</h3>
                      <div style={{ backgroundColor: "#1e293b", padding: "15px", borderRadius: "6px", borderLeft: "3px solid #8b5cf6" }}>
                        <p style={{ margin: 0, color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                          {profile.securityReport.plagReport}
                        </p>
                      </div>
                    </div>

                    <h3 style={{ margin: "20px 0 10px 0", fontSize: "14px", color: "#e2e8f0", textTransform: "uppercase" }}>Proctored Test Rankings</h3>
                    {testResults && testResults.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {testResults.map(tr => (
                          <div key={tr.id} style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#1e293b", padding: "12px", borderRadius: "6px" }}>
                            <div>
                              <strong style={{ color: "#e2e8f0", display: "block" }}>{tr.domain}</strong>
                              <span style={{ fontSize: "12px", color: "#94a3b8", textTransform: "capitalize" }}>{tr.testCategory} Level • {tr.status}</span>
                            </div>
                            <div style={{ color: "#8b5cf6", fontWeight: "bold", fontSize: "20px" }}>{tr.score}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: "15px", backgroundColor: "#1e293b", borderRadius: "6px", color: "#94a3b8", fontSize: "14px" }}>No tests taken.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={pageStyle}>
      <Navbar />
      <div style={contentStyle}>
        <div style={{ borderBottom: "1px solid #1e293b", paddingBottom: "20px", marginBottom: "30px" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", backgroundColor: "#312e81", color: "#a5b4fc", borderRadius: "999px", fontSize: "12px", fontWeight: "bold", marginBottom: "10px" }}>
            RECRUITER INTELLIGENCE LAYER
          </div>
          <h1 style={{ fontSize: "36px", margin: "0 0 10px 0", color: "#f8fafc" }}>Hiring Intelligence Center</h1>
          <p style={{ color: "#94a3b8", fontSize: "18px", margin: "0" }}>Deploy assessments, post jobs, and consume mathematical candidate rankings.</p>
        </div>

        <div style={{ display: "flex", gap: "5px", marginBottom: "20px", borderBottom: "1px solid #1e293b", overflowX: "auto" }}>
          <button style={tabBtnStyle(activeTab === "welcome")} onClick={() => setActiveTab("welcome")}>Home</button>
          <button style={tabBtnStyle(activeTab === "intelligence")} onClick={() => setActiveTab("intelligence")}>Intelligence System</button>
          <button style={tabBtnStyle(activeTab === "assessments")} onClick={() => setActiveTab("assessments")}>Assessments & Hackathons</button>
          <button style={tabBtnStyle(activeTab === "jobs")} onClick={() => setActiveTab("jobs")}>Job Postings</button>
          <button style={tabBtnStyle(activeTab === "overview")} onClick={() => setActiveTab("overview")}>Company Overview</button>
        </div>

        {/* ===================== WELCOME TAB (LANDING PAGE) ===================== */}
        {activeTab === "welcome" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <div style={{ 
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", 
              padding: "60px 40px", 
              borderRadius: "16px", 
              border: "1px solid #334155", 
              marginBottom: "30px",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "50%", height: "200%", background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(15,23,42,0) 70%)", transform: "rotate(15deg)" }}></div>
              <h1 style={{ fontSize: "48px", color: "#f8fafc", margin: "0 0 20px 0", lineHeight: "1.2", position: "relative", zIndex: 1 }}>
                Hire on <span style={{ color: "#38bdf8", textShadow: "0 0 20px rgba(56,189,248,0.3)" }}>Merit.</span><br/>Not Resumes.
              </h1>
              <p style={{ fontSize: "20px", color: "#cbd5e1", maxWidth: "800px", lineHeight: "1.6", margin: "0 0 40px 0", position: "relative", zIndex: 1 }}>
                Welcome to the TalentTuner Recruiter Intelligence Platform. We’ve rebuilt the hiring pipeline to prioritize deterministic, mathematically verified skills over formatted text.
              </p>
              <button 
                onClick={() => setActiveTab("intelligence")}
                style={{ backgroundColor: "#38bdf8", color: "#0f172a", border: "none", padding: "16px 32px", fontSize: "18px", fontWeight: "900", borderRadius: "8px", cursor: "pointer", transition: "transform 0.2s, boxShadow 0.2s", boxShadow: "0 4px 14px rgba(56,189,248,0.4)", position: "relative", zIndex: 1 }}
                onMouseOver={e => e.target.style.transform = "translateY(-2px)"}
                onMouseOut={e => e.target.style.transform = "translateY(0)"}
              >
                Access Intelligence System &rarr;
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "25px", marginBottom: "40px" }}>
              <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "16px", border: "1px solid #334155" }}>
                <h3 style={{ color: "#10b981", fontSize: "24px", margin: "0 0 15px 0" }}>What We Do</h3>
                <p style={{ color: "#94a3b8", lineHeight: "1.7", margin: 0, fontSize: "16px" }}>
                  We provide a heavily proctored, AI-monitored assessment layer that ranks candidates universally based on their raw technical ability. We run deep algorithmic analysis on their projects, scrutinize code authenticity, and force candidates to prove their skills live. 
                </p>
              </div>
              <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "16px", border: "1px solid #334155" }}>
                <h3 style={{ color: "#8b5cf6", fontSize: "24px", margin: "0 0 15px 0" }}>How We Do It</h3>
                <p style={{ color: "#94a3b8", lineHeight: "1.7", margin: 0, fontSize: "16px" }}>
                  Through our <strong>Proctored Environment</strong>, we lock the candidate's device, monitor their webcam for unauthorized devices, and use Speech Recognition to detect external help. Our GPT-4o engine actively scores their Github submissions for originality and architecture.
                </p>
              </div>
              <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "16px", border: "1px solid #334155" }}>
                <h3 style={{ color: "#f59e0b", fontSize: "24px", margin: "0 0 15px 0" }}>Why We Are Different</h3>
                <p style={{ color: "#94a3b8", lineHeight: "1.7", margin: 0, fontSize: "16px" }}>
                  Traditional platforms hand you thousands of unverified PDFs. We hand you a fully processed mathematical leaderboard. If a candidate is at the top of our Intelligence System, it is mathematically guaranteed they have the highest proficiency and fastest problem-solving speeds.
                </p>
              </div>
              <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "16px", border: "1px solid #334155" }}>
                <h3 style={{ color: "#ef4444", fontSize: "24px", margin: "0 0 15px 0" }}>Why Trust Our Process?</h3>
                <p style={{ color: "#94a3b8", lineHeight: "1.7", margin: 0, fontSize: "16px" }}>
                  Our zero-tolerance <strong>3-Strike Anti-Cheat System</strong> means if a candidate attempts to switch tabs, use a phone, or ask for help, they are permanently banned. When you hire from TalentTuner, you are hiring verified, battle-tested talent.
                </p>
              </div>
            </div>
            
            {/* Animated Flowchart */}
            <div className="flowchart-container" style={{ marginTop: "20px" }}>
              <h2 style={{ fontSize: "28px", color: "#f8fafc", marginBottom: "30px", background: "linear-gradient(90deg, #10b981, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                The Intelligence Workflow
              </h2>
              <div className="flowchart-row semicircle-4">
                <div className="flowchart-node" style={{ animationDelay: "0s" }}>
                  <div style={{ fontSize: "30px", marginBottom: "10px" }}>📝</div>
                  <h4>Deploy Tests</h4>
                  <p>Create strict assessments or hackathon problems targeted at specific domains.</p>
                </div>
                <div className="flowchart-arrow" style={{ animationDelay: "0.2s" }}>&rarr;</div>
                <div className="flowchart-node" style={{ animationDelay: "0.4s" }}>
                  <div style={{ fontSize: "30px", marginBottom: "10px" }}>🛡️</div>
                  <h4>Proctored Attempts</h4>
                  <p>Candidates attempt challenges under live AI camera & microphone monitoring.</p>
                </div>
                <div className="flowchart-arrow" style={{ animationDelay: "0.6s" }}>&rarr;</div>
                <div className="flowchart-node" style={{ animationDelay: "0.8s" }}>
                  <div style={{ fontSize: "30px", marginBottom: "10px" }}>🧠</div>
                  <h4>Authenticity Check</h4>
                  <p>Our algorithms scan their code for plagiarism and structural integrity.</p>
                </div>
                <div className="flowchart-arrow" style={{ animationDelay: "1s" }}>&rarr;</div>
                <div className="flowchart-node" style={{ animationDelay: "1.2s", borderColor: "#f59e0b", animation: "none", boxShadow: "0 0 15px rgba(245, 158, 11, 0.5)" }}>
                  <div style={{ fontSize: "30px", marginBottom: "10px" }}>📊</div>
                  <h4>Rank & Hire</h4>
                  <p>Top performers are mathematically ranked on your dashboard for immediate hiring.</p>
                </div>
              </div>
            </div>
            
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          </div>
        )}

        {/* ===================== OVERVIEW TAB ===================== */}
        {activeTab === "overview" && (
          <div>
            {loadingProfile ? <p style={{ color: "#94a3b8" }}>Loading company overview...</p> : profileData && (
              <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                
                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
                  <div 
                    onClick={() => setActiveTab("jobs")}
                    onMouseOver={e=>e.currentTarget.style.borderColor="#38bdf8"} 
                    onMouseOut={e=>e.currentTarget.style.borderColor="#334155"}
                    style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155", cursor: "pointer", transition: "border-color 0.2s" }}
                  >
                    <h4 style={{ margin: "0 0 10px 0", color: "#94a3b8", fontSize: "14px", textTransform: "uppercase" }}>Total Jobs Posted</h4>
                    <span style={{ fontSize: "36px", fontWeight: "900", color: "#38bdf8" }}>{profileData.stats.totalJobs}</span>
                  </div>
                  <div 
                    onClick={() => setActiveTab("jobs")}
                    onMouseOver={e=>e.currentTarget.style.borderColor="#10b981"} 
                    onMouseOut={e=>e.currentTarget.style.borderColor="#334155"}
                    style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155", cursor: "pointer", transition: "border-color 0.2s" }}
                  >
                    <h4 style={{ margin: "0 0 10px 0", color: "#94a3b8", fontSize: "14px", textTransform: "uppercase" }}>Job Applicants</h4>
                    <span style={{ fontSize: "36px", fontWeight: "900", color: "#10b981" }}>{profileData.stats.totalJobApplicants}</span>
                  </div>
                  <div 
                    onClick={() => setActiveTab("assessments")}
                    onMouseOver={e=>e.currentTarget.style.borderColor="#8b5cf6"} 
                    onMouseOut={e=>e.currentTarget.style.borderColor="#334155"}
                    style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155", cursor: "pointer", transition: "border-color 0.2s" }}
                  >
                    <h4 style={{ margin: "0 0 10px 0", color: "#94a3b8", fontSize: "14px", textTransform: "uppercase" }}>Assessments</h4>
                    <span style={{ fontSize: "36px", fontWeight: "900", color: "#8b5cf6" }}>{profileData.stats.totalAssessments}</span>
                  </div>
                  <div 
                    onClick={() => setActiveTab("assessments")}
                    onMouseOver={e=>e.currentTarget.style.borderColor="#f59e0b"} 
                    onMouseOut={e=>e.currentTarget.style.borderColor="#334155"}
                    style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155", cursor: "pointer", transition: "border-color 0.2s" }}
                  >
                    <h4 style={{ margin: "0 0 10px 0", color: "#94a3b8", fontSize: "14px", textTransform: "uppercase" }}>Test Submissions</h4>
                    <span style={{ fontSize: "36px", fontWeight: "900", color: "#f59e0b" }}>{profileData.stats.totalSubmissions}</span>
                  </div>
                </div>

                {/* Profile Editor */}
                <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", border: "1px solid #334155" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0, fontSize: "24px", color: "#f8fafc" }}>Company Profile</h2>
                    {!editingProfile && (
                      <button onClick={() => setEditingProfile(true)} style={{ backgroundColor: "#38bdf8", color: "#0f172a", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {!editingProfile ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", color: "#cbd5e1" }}>
                      <div><strong style={{ color: "#94a3b8", display: "block", marginBottom: "5px" }}>Company Name</strong> {profileData.profile.companyName || "Not Set"}</div>
                      <div><strong style={{ color: "#94a3b8", display: "block", marginBottom: "5px" }}>Location</strong> {profileData.profile.location || "Not Set"}</div>
                      <div><strong style={{ color: "#94a3b8", display: "block", marginBottom: "5px" }}>Website</strong> {profileData.profile.website ? <a href={profileData.profile.website} target="_blank" rel="noreferrer" style={{color:"#38bdf8"}}>{profileData.profile.website}</a> : "Not Set"}</div>
                      <div><strong style={{ color: "#94a3b8", display: "block", marginBottom: "5px" }}>LinkedIn</strong> {profileData.profile.linkedinUrl ? <a href={profileData.profile.linkedinUrl} target="_blank" rel="noreferrer" style={{color:"#38bdf8"}}>{profileData.profile.linkedinUrl}</a> : "Not Set"}</div>
                      <div><strong style={{ color: "#94a3b8", display: "block", marginBottom: "5px" }}>X (Twitter)</strong> {profileData.profile.xUrl ? <a href={profileData.profile.xUrl} target="_blank" rel="noreferrer" style={{color:"#38bdf8"}}>{profileData.profile.xUrl}</a> : "Not Set"}</div>
                      <div>
                        <strong style={{ color: "#94a3b8", display: "block", marginBottom: "5px" }}>Email Notifications</strong>
                        <span style={{ backgroundColor: profileData.profile.notificationsOn !== false ? "#064e3b" : "#7f1d1d", color: profileData.profile.notificationsOn !== false ? "#10b981" : "#ef4444", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                          {profileData.profile.notificationsOn !== false ? "ENABLED" : "DISABLED"}
                        </span>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}><strong style={{ color: "#94a3b8", display: "block", marginBottom: "5px" }}>About Company</strong> <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{profileData.profile.description || "No description provided."}</p></div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Company Name</label>
                        <input style={inputStyle} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Acme Corp" />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Location</label>
                        <input style={inputStyle} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Website URL</label>
                        <input style={inputStyle} type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://acmecorp.com" />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>LinkedIn URL</label>
                        <input style={inputStyle} type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/company/acmecorp" />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>X (Twitter) URL</label>
                        <input style={inputStyle} type="url" value={xUrl} onChange={e => setXUrl(e.target.value)} placeholder="https://x.com/acmecorp" />
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", color: "#cbd5e1", cursor: "pointer" }}>
                          <input type="checkbox" checked={notificationsOn} onChange={e => setNotificationsOn(e.target.checked)} style={{ width: "20px", height: "20px", accentColor: "#38bdf8" }} />
                          Enable Email Notifications for new applicants
                        </label>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>About Company</label>
                        <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your company and mission..." />
                      </div>
                      <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px" }}>
                        <button type="submit" disabled={savingProfile} style={{ padding: "10px 20px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                          {savingProfile ? "Saving..." : "Save Profile"}
                        </button>
                        <button type="button" onClick={() => setEditingProfile(false)} style={{ padding: "10px 20px", backgroundColor: "transparent", color: "#cbd5e1", border: "1px solid #475569", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ===================== INTELLIGENCE TAB ===================== */}
        {activeTab === "intelligence" && (
          <div>
            <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", border: "1px solid #334155", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ maxWidth: "60%" }}>
                <h2 style={{ margin: "0 0 10px 0", color: "#f8fafc", fontSize: "24px" }}>
                  <span style={{ color: "#38bdf8" }}>Recruiter Intelligence Layer</span>
                </h2>
                <p style={{ margin: 0, color: "#94a3b8", lineHeight: "1.6" }}>
                  Trust data, not resumes. This system provides a mathematical, skill-based meritocracy. Candidates listed here have been rigorously vetted through AI-proctored baseline exams. They are ranked purely by deterministic merit—the highest accumulated scores with the fastest completion times inherently rise to the top. Select a domain below to browse the verified talent pool.
                </p>
              </div>
              <div style={{ minWidth: "250px" }}>
                <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1", fontWeight: "bold" }}>Analyze Domain</label>
                <select style={inputStyle} value={intelligenceDomain} onChange={e => setIntelligenceDomain(e.target.value)}>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Product & Design">Product & Design</option>
                </select>
              </div>
            </div>

            <h3 style={{ color: "#38bdf8", borderBottom: "1px solid #1e293b", paddingBottom: "10px", marginBottom: "20px" }}>Verified Candidate Rankings</h3>
            
            {loadingLeaderboard ? <p style={{ color: "#94a3b8" }}>Aggregating intelligence data...</p> : leaderboard.length === 0 ? (
              <div style={{ backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", border: "1px solid #334155", textAlign: "center" }}>
                <p style={{ color: "#94a3b8" }}>No proctored candidates have completed exams in this domain yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", padding: "10px 20px", color: "#64748b", fontWeight: "bold", fontSize: "14px", borderBottom: "1px solid #334155" }}>
                  <div style={{ width: "50px" }}>Rank</div>
                  <div style={{ flex: 2 }}>Candidate</div>
                  <div style={{ flex: 1, textAlign: "center" }}>Total Score</div>
                  <div style={{ flex: 1, textAlign: "center" }}>Avg Time/Test</div>
                  <div style={{ flex: 1, textAlign: "right" }}>Tests Completed</div>
                </div>
                {leaderboard.map((user, idx) => (
                  <div key={user.candidate.id} style={{ display: "flex", alignItems: "center", backgroundColor: "#1e293b", padding: "15px 20px", borderRadius: "8px", border: "1px solid #334155", transition: "all 0.2s" }}>
                    <div style={{ width: "50px", fontWeight: "bold", fontSize: "18px", color: idx === 0 ? "#fbbf24" : idx === 1 ? "#94a3b8" : idx === 2 ? "#b45309" : "#64748b" }}>
                      #{idx + 1}
                    </div>
                    <div style={{ flex: 2 }}>
                      <strong 
                        onClick={() => setSelectedCandidate(user.candidate)}
                        style={{ color: "#f8fafc", fontSize: "16px", cursor: "pointer", textDecoration: "underline" }}
                        onMouseOver={e=>e.target.style.color="#38bdf8"} 
                        onMouseOut={e=>e.target.style.color="#f8fafc"}
                      >
                        {user.candidate.name}
                      </strong>
                      <p style={{ margin: "2px 0 0 0", color: "#94a3b8", fontSize: "12px" }}>{user.candidate.email}</p>
                    </div>
                    <div style={{ flex: 1, textAlign: "center", fontSize: "20px", fontWeight: "900", color: "#10b981" }}>
                      {user.totalScore}
                    </div>
                    <div style={{ flex: 1, textAlign: "center", color: "#cbd5e1" }}>
                      {Math.floor((user.totalTime / user.testsCompleted) / 60)}m {(Math.floor(user.totalTime / user.testsCompleted) % 60).toString().padStart(2, '0')}s
                    </div>
                    <div style={{ flex: 1, textAlign: "right", color: "#64748b" }}>
                      {user.testsCompleted}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== JOBS TAB ===================== */}
        {activeTab === "jobs" && (
          <div>
            <div style={cardStyle}>
              <h2 style={{ fontSize: "24px", margin: "0 0 20px 0", color: "#38bdf8" }}>Post a Job</h2>
              <form onSubmit={handleCreateJob}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Job Title</label>
                    <input style={inputStyle} value={jobTitle} onChange={e => setJobTitle(e.target.value)} required placeholder="e.g. Senior Frontend Engineer" />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Domain</label>
                    <select style={inputStyle} value={jobDomain} onChange={e => setJobDomain(e.target.value)}>
                      <option>Software Engineering</option>
                      <option>Data Science & AI</option>
                      <option>Cloud & DevOps</option>
                      <option>Cybersecurity</option>
                      <option>Product & Design</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Location</label>
                    <input style={inputStyle} value={jobLocation} onChange={e => setJobLocation(e.target.value)} required placeholder="e.g. Bangalore, India" />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Experience Level</label>
                    <select style={inputStyle} value={jobExp} onChange={e => setJobExp(e.target.value)}>
                      <option>Entry Level</option>
                      <option>Mid Level</option>
                      <option>Senior Level</option>
                      <option>Executive</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Salary Range</label>
                    <select style={inputStyle} value={jobSalary} onChange={e => setJobSalary(e.target.value)}>
                      <option>$0 - $50k</option>
                      <option>$50k - $100k</option>
                      <option>$100k - $150k</option>
                      <option>$150k+</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Job Type</label>
                    <select style={inputStyle} value={jobType} onChange={e => setJobType(e.target.value)}>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                    </select>
                  </div>
                </div>

                <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Required Skills (comma separated)</label>
                <input style={inputStyle} value={jobSkills} onChange={e => setJobSkills(e.target.value)} required placeholder="e.g. React, Node.js, AWS" />

                <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Job Description</label>
                <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} value={jobDesc} onChange={e => setJobDesc(e.target.value)} required placeholder="Describe the responsibilities..." />

                <button type="submit" disabled={creatingJob} style={{ padding: "12px 24px", backgroundColor: creatingJob ? "#1e3a8a" : "#10b981", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: creatingJob ? "not-allowed" : "pointer" }}>
                  {creatingJob ? "Posting..." : "Post Job to Candidates"}
                </button>
              </form>
            </div>

            <h2 style={{ fontSize: "24px", color: "#f8fafc", margin: "0 0 20px 0" }}>Active Jobs & Applicants</h2>
            {loadingJobs ? <p>Loading jobs...</p> : jobs.length === 0 ? <p style={{ color: "#94a3b8" }}>No jobs posted yet.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                {jobs.map(job => (
                  <div key={job.id} style={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
                    <div style={{ padding: "20px", backgroundColor: "#0f172a", borderBottom: "1px solid #334155" }}>
                      <h3 style={{ margin: "0 0 8px 0", color: "#f8fafc", fontSize: "20px" }}>{job.title}</h3>
                      <div style={{ display: "flex", gap: "10px", color: "#94a3b8", fontSize: "13px" }}>
                        <span>📍 {job.location}</span>
                        <span>💼 {job.jobType}</span>
                        <span>💰 {job.salaryRange}</span>
                        <span style={{ color: "#38bdf8", fontWeight: "bold", marginLeft: "auto" }}>{job.applications.length} Applicants</span>
                      </div>
                    </div>

                    <div style={{ padding: "20px" }}>
                      {job.applications.length === 0 ? <p style={{ color: "#64748b", margin: 0 }}>No applicants yet.</p> : (
                        <table style={{ width: "100%", borderCollapse: "collapse", color: "#e2e8f0" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid #334155", textAlign: "left" }}>
                              <th style={{ padding: "10px 0", color: "#94a3b8", fontWeight: "normal" }}>Candidate</th>
                              <th style={{ padding: "10px 0", color: "#94a3b8", fontWeight: "normal" }}>AI Authenticity</th>
                              <th style={{ padding: "10px 0", color: "#94a3b8", fontWeight: "normal", textAlign: "right" }}>Highest Test Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {job.applications.map(app => {
                              const cand = app.candidate;
                              const auth = cand.profile?.securityReport?.overallAuthenticity || 0;
                              const topTest = Math.max(0, ...cand.testResults.map(t => t.score));
                              
                              return (
                                <tr key={app.id} style={{ borderBottom: "1px solid #1e293b" }}>
                                  <td style={{ padding: "12px 0", fontWeight: "bold" }}>
                                    <span 
                                      onClick={() => setSelectedCandidate(cand)} 
                                      style={{ color: "#38bdf8", cursor: "pointer", textDecoration: "underline" }}
                                      onMouseOver={e=>e.target.style.color="#0ea5e9"} 
                                      onMouseOut={e=>e.target.style.color="#38bdf8"}
                                    >
                                      {cand.name}
                                    </span>
                                  </td>
                                  <td style={{ padding: "12px 0", color: auth > 80 ? "#10b981" : "#f59e0b" }}>{auth}%</td>
                                  <td style={{ padding: "12px 0", color: "#8b5cf6", textAlign: "right" }}>{topTest}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== ASSESSMENTS TAB ===================== */}
        {activeTab === "assessments" && (
          <div>
            <div style={cardStyle}>
              <h2 style={{ fontSize: "24px", margin: "0 0 20px 0", color: "#8b5cf6" }}>Deploy New Assessment</h2>
              <form onSubmit={handleCreateAssessment}>
                <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Assessment Title</label>
                    <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Scalable API Architecture Challenge" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Type</label>
                    <select style={inputStyle} value={type} onChange={e => setType(e.target.value)}>
                      <option value="Test">Test</option>
                      <option value="Project">Project Problem Statement</option>
                      <option value="Hackathon">Hackathon Challenge</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Domain</label>
                    <select style={inputStyle} value={assessmentDomain} onChange={e => setAssessmentDomain(e.target.value)}>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Data Science & AI">Data Science & AI</option>
                      <option value="Cloud & DevOps">Cloud & DevOps</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Product & Design">Product & Design</option>
                    </select>
                  </div>
                </div>
                
                <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Problem Statement / Requirements</label>
                <textarea style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} value={problemStatement} onChange={e => setProblemStatement(e.target.value)} required placeholder="Describe the technical requirements..." />
                
                <button type="submit" disabled={creatingAssessment} style={{ padding: "12px 24px", backgroundColor: creatingAssessment ? "#1e3a8a" : "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: creatingAssessment ? "not-allowed" : "pointer" }}>
                  {creatingAssessment ? "Deploying..." : "Deploy Assessment to Global Network"}
                </button>
              </form>
            </div>

            <h2 style={{ fontSize: "24px", color: "#f8fafc", margin: "0 0 20px 0" }}>Active Deployments</h2>
            {loadingAssessments ? <p>Loading...</p> : assessments.length === 0 ? <p style={{ color: "#94a3b8" }}>No assessments deployed.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                {assessments.map(assessment => (
                  <div key={assessment.id} style={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
                    <div style={{ padding: "20px", backgroundColor: "#0f172a", borderBottom: "1px solid #334155" }}>
                      <h3 style={{ fontSize: "20px", margin: "0 0 8px 0", color: "#f8fafc" }}>{assessment.title}</h3>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <span style={{ backgroundColor: "#312e81", color: "#a5b4fc", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>{assessment.type}</span>
                        <span style={{ backgroundColor: "#064e3b", color: "#34d399", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>{assessment.domain}</span>
                        <span style={{ backgroundColor: "#334155", color: "#cbd5e1", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>{assessment.submissions.length} Submissions</span>
                      </div>
                    </div>
                    <div style={{ padding: "20px" }}>
                      <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "20px", whiteSpace: "pre-wrap" }}>{assessment.problemStatement}</p>
                      
                      {assessment.submissions.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                          {assessment.submissions.map(sub => {
                            const report = sub.aiSecurityReport || { authenticityScore: 0, problemSolvedScore: 0, analysis: "Processing" };
                            const authColor = report.authenticityScore > 80 ? "#10b981" : report.authenticityScore > 50 ? "#f59e0b" : "#ef4444";
                            return (
                              <div key={sub.id} style={{ backgroundColor: "#0f172a", padding: "15px", borderRadius: "8px", borderLeft: `4px solid ${authColor}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                  <div>
                                    <strong 
                                      onClick={() => setSelectedCandidate(sub.candidate)}
                                      style={{ color: "#38bdf8", fontSize: "16px", display: "block", cursor: "pointer", textDecoration: "underline" }}
                                      onMouseOver={e=>e.target.style.color="#0ea5e9"} 
                                      onMouseOut={e=>e.target.style.color="#38bdf8"}
                                    >
                                      {sub.candidate.name}
                                    </strong>
                                    <span style={{ color: "#64748b", fontSize: "12px" }}>{sub.candidate.email}</span>
                                  </div>
                                  <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#38bdf8" }}>{sub.score}% Score</div>
                                  </div>
                                </div>
                                <p style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: "1.5", margin: "10px 0", backgroundColor: "#1e293b", padding: "10px", borderRadius: "6px" }}>
                                  <strong style={{ color: "#8b5cf6" }}>AI Analyst: </strong>{report.analysis}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
      </div>
      {renderCandidateViewer()}
    </div>
  );
}
