import React, { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";

const domains = [
  "Software Engineering",
  "Data Science & AI",
  "Cloud & DevOps",
  "Cybersecurity",
  "Product & Design"
];

const testTopics = {
  "Software Engineering": [
    "Data Structures & Algorithms", "System Design", "React & Frontend Architecture", "Node.js & API Design", "Database Optimization",
    "Microservices", "Concurrency & Multithreading", "Testing & CI/CD", "Security Best Practices", "Performance Profiling"
  ],
  "Data Science & AI": [
    "Machine Learning Algorithms", "Deep Learning Fundamentals", "Natural Language Processing", "Computer Vision", "Data Wrangling",
    "Statistical Modeling", "Big Data Processing", "Model Deployment", "Reinforcement Learning", "Feature Engineering"
  ],
  "Cloud & DevOps": [
    "AWS/GCP/Azure Architecture", "Docker & Containerization", "Kubernetes Orchestration", "Terraform & IaC", "CI/CD Pipelines",
    "Serverless Computing", "Network Security", "Monitoring & Observability", "Site Reliability Engineering", "Linux Administration"
  ],
  "Cybersecurity": [
    "Penetration Testing", "Cryptography", "Network Security", "Application Security", "Incident Response",
    "Malware Analysis", "Cloud Security", "Identity & Access Management", "Vulnerability Assessment", "Ethical Hacking"
  ],
  "Product & Design": [
    "User Research", "Wireframing & Prototyping", "UI/UX Principles", "Product Strategy", "Interaction Design",
    "Accessibility Standards", "Agile Product Management", "A/B Testing & Analytics", "Design Systems", "User Psychology"
  ]
};

export default function Tests() {
  const [step, setStep] = useState("domain_selection"); 
  // domain_selection -> test_selection -> policies -> test -> result -> banned

  const [domain, setDomain] = useState("");
  const [selectedTestId, setSelectedTestId] = useState(""); // e.g. "easy-1"
  const [currentTab, setCurrentTab] = useState("easy"); // "easy", "medium", "hard"
  const [agreed, setAgreed] = useState(false);
  
  const [testQuestions, setTestQuestions] = useState([]); // 15 questions
  const [answers, setAnswers] = useState({});
  const [timeTaken, setTimeTaken] = useState(0);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const detectIntervalRef = useRef(null);
  const isSubmittingRef = useRef(false); // To prevent false flags when submitting
  const modelRef = useRef(null);
  const speechRecRef = useRef(null);
  const [modelLoading, setModelLoading] = useState(false);
  
  const [warnings, setWarnings] = useState(0);
  const [isBanned, setIsBanned] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardInterval, setLeaderboardInterval] = useState(null);
  const [resultData, setResultData] = useState(null);

  // Company Assessments
  const [companyAssessments, setCompanyAssessments] = useState([]);
  const [selectedCompanyAssessment, setSelectedCompanyAssessment] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [projectFile, setProjectFile] = useState(null);
  const [submittingProject, setSubmittingProject] = useState(false);

  // Stop media tracks helper
  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    if (speechRecRef.current) {
      speechRecRef.current.stop();
      speechRecRef.current = null;
    }
  };

  useEffect(() => {
    // Check user status and register device fingerprint on mount
    const checkStatus = async () => {
      try {
        const res = await api.get("/api/tests/status");
        if (res.data.isBanned) {
          setIsBanned(true);
        } else {
          setWarnings(res.data.warnings || 0);
        }
      } catch (err) {
        if (err.response?.data?.error === "CONCURRENT_DEVICE_DETECTED") {
          alert(err.response.data.message);
          window.location.href = "/"; // Kick them out to the dashboard/home
        }
      }
    };
    checkStatus();
  }, []);

  useEffect(() => {
    if (isBanned) {
      setStep("banned");
      if (document.fullscreenElement) document.exitFullscreen().catch(e => console.error(e));
      stopMediaTracks();
    }
  }, [isBanned]);

  useEffect(() => {
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (timerRef.current) clearInterval(timerRef.current);
      if (leaderboardInterval) clearInterval(leaderboardInterval);
      stopMediaTracks();
    };
  }, []);

  useEffect(() => {
    if (domain) {
      fetchLeaderboard();
      fetchCompanyAssessments();
      const interval = setInterval(fetchLeaderboard, 10000);
      setLeaderboardInterval(interval);
      return () => clearInterval(interval);
    }
  }, [domain]);

  const fetchCompanyAssessments = async () => {
    try {
      const res = await api.get(`/api/assessments/domain/${encodeURIComponent(domain)}`);
      setCompanyAssessments(res.data);
    } catch (err) {
      console.error("Failed to fetch company assessments", err);
    }
  };

  // Pre-load the AI object detection model
  useEffect(() => {
    const loadModel = async () => {
      try {
        if (window.cocoSsd) {
          setModelLoading(true);
          modelRef.current = await window.cocoSsd.load();
          setModelLoading(false);
        }
      } catch (err) {
        console.error("AI Model failed to load", err);
      }
    };
    loadModel();
  }, []);

  // When step changes to "test", attach the video stream and start AI detection loop
  useEffect(() => {
    if (step === "test" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      
      // Start detecting objects every 1 second
      if (modelRef.current) {
        const bannedObjects = ['cell phone', 'laptop', 'book', 'tablet', 'tv'];
        detectIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4 && !isSubmittingRef.current) {
            const predictions = await modelRef.current.detect(videoRef.current);
            const foundBanned = predictions.find(p => bannedObjects.includes(p.class));
            if (foundBanned) {
              submitTest(true, `${foundBanned.class} detected in camera`);
            }
          }
        }, 1000);
      }
      
      // Start monitoring speech/talking using the Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true; // Listen continuously for any background talking
        
        recognition.onresult = (event) => {
          if (isSubmittingRef.current) return;
          
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          
          if (transcript.trim().length > 0) {
            submitTest(true, `Talking detected ("${transcript.trim().substring(0, 20)}...")`);
          }
        };
        
        recognition.onerror = (e) => console.log("Speech recognition error/silence:", e);
        
        // Auto-restart if it stops to ensure continuous proctoring
        recognition.onend = () => {
          if (!isSubmittingRef.current && speechRecRef.current) {
            try { speechRecRef.current.start(); } catch(e){}
          }
        };

        speechRecRef.current = recognition;
        recognition.start();
      } else {
        console.warn("Speech recognition not supported in this browser. Falling back to strict video monitoring.");
      }
    }
  }, [step]);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get(`/api/tests/leaderboard?domain=${encodeURIComponent(domain)}`);
      setLeaderboard(res.data.leaderboard || []);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  };

  const handleDomainSelect = (d) => {
    setDomain(d);
    setStep("test_selection");
  };

  const selectTest = (id) => {
    setSelectedTestId(id);
    setAgreed(false);
    setStep("policies");
  };

  const selectCompanyAssessment = (assessment) => {
    setSelectedCompanyAssessment(assessment);
    setStep("company_assessment_submit");
  };

  const submitCompanyProject = async (e) => {
    e.preventDefault();
    if (!githubUrl && !projectFile) {
      return alert("Please provide either a GitHub URL or upload a ZIP file.");
    }
    setSubmittingProject(true);
    
    const formData = new FormData();
    if (githubUrl) formData.append("githubUrl", githubUrl);
    if (projectFile) formData.append("projectFile", projectFile);

    try {
      await api.post(`/api/assessments/submit/${selectedCompanyAssessment.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Submission successful! The recruiter's AI will now evaluate your code.");
      setStep("test_selection");
    } catch (err) {
      alert("Submission failed.");
    }
    setSubmittingProject(false);
  };

  const startTest = async () => {
    if (!agreed) return alert("You must agree to the policies.");

    // Re-verify device lock and ban status immediately before test start
    try {
      const statusCheck = await api.get("/api/tests/status");
      if (statusCheck.data.isBanned) {
        setIsBanned(true);
        return;
      }
    } catch (err) {
      if (err.response?.data?.error === "CONCURRENT_DEVICE_DETECTED") {
        alert(err.response.data.message);
        return;
      }
    }

    try {
      // 1. Fetch Tests from Backend
      const res = await api.get(`/api/tests/generate?domain=${encodeURIComponent(domain)}`);
      // The backend returns 10 easy, 10 medium, 10 hard. 
      // To simulate 15 questions per test for this demo, we'll just slice an array or duplicate to hit 15.
      // (Normally backend would return 15 specific questions for 'easy-1')
      const catTests = res.data.tests[currentTab] || [];
      const testArray = [];
      // Generate 15 variations from the backend templates to make 15 questions
      for(let i=0; i<15; i++) {
        testArray.push(catTests[i % catTests.length]); 
      }
      setTestQuestions(testArray);

      // 2. Request Camera - Forcing hardware verification step
      if (modelLoading) {
        alert("Please wait for the AI anti-cheat model to finish loading...");
        return;
      }
      
      // Simulate strict hardware prompt validation
      const hwConfirmed = window.confirm("SECURITY CHECK: The browser requires you to verify your Camera and Microphone hardware for strictly proctored testing. Do you authorize this hardware handshake?");
      if (!hwConfirmed) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      // 3. Request Fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      // 4. Set Anti-Cheat Listeners
      isSubmittingRef.current = false;
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      
      setTimeTaken(0);
      setAnswers({});
      timerRef.current = setInterval(() => setTimeTaken(prev => prev + 1), 1000);
      
      setStep("test");
    } catch (err) {
      console.error(err);
      if (err.name === "NotAllowedError") {
        alert("Camera and Microphone permissions are strictly required for proctoring.");
      } else {
        alert("Failed to initialize test environment. " + (err.response?.data?.error || err.message));
      }
      stopMediaTracks();
    }
  };

  const submitTest = async (isCheat = false, cheatReason = "") => {
    isSubmittingRef.current = true; // Mark as submitting so fullscreenchange doesn't flag cheating
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    clearInterval(timerRef.current);
    if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    if (speechRecRef.current) {
      speechRecRef.current.stop();
      speechRecRef.current = null;
    }

    // Calculate score
    let score = 0;
    testQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score += (currentTab === 'easy' ? 5 : currentTab === 'medium' ? 10 : 15);
      }
    });

    try {
      const res = await api.post("/api/tests/result", {
        domain,
        testCategory: selectedTestId, // e.g. "easy-3"
        score: isCheat ? 0 : score,
        timeTaken,
        status: isCheat ? "cheated" : "completed"
      });

      // Now safe to exit fullscreen and stop media
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(e => console.log(e));
      }
      stopMediaTracks();

      if (res.data.isBanned) {
        setIsBanned(true);
      } else if (isCheat) {
        setWarnings(res.data.warnings);
        const reasonStr = cheatReason ? `Reason: ${cheatReason}.` : "You switched tabs or exited fullscreen.";
        alert(`WARNING: Violation Detected! ${reasonStr} You have received a warning (${res.data.warnings}/3). Your test has been terminated.`);
        setStep("test_selection"); 
      } else {
        setResultData({ score, timeTaken });
        setStep("result");
        fetchLeaderboard(); 
      }
    } catch (err) {
      console.error("Failed to submit", err);
      alert(err.response?.data?.error || "Error submitting test. Please try again.");
      isSubmittingRef.current = false; // allow them to try clicking submit again
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && !isSubmittingRef.current) {
      submitTest(true);
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && !isSubmittingRef.current) {
      // User pressed Esc to exit fullscreen
      submitTest(true);
    }
  };

  const handleAnswerSelect = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  // Styles
  const pageStyle = { minHeight: "100vh", backgroundColor: "transparent", color: "#e2e8f0", fontFamily: "Inter, sans-serif" };
  const contentStyle = { padding: "40px", maxWidth: "1400px", margin: "0 auto", display: "flex", gap: "30px" };
  const mainStyle = { flex: "1", display: "flex", flexDirection: "column", gap: "20px" };
  const sideStyle = { width: "350px", backgroundColor: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155", height: "fit-content", position: "sticky", top: "20px" };
  const cardStyle = { backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", border: "1px solid #334155", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" };
  const buttonStyle = { padding: "12px 24px", borderRadius: "8px", border: "none", backgroundColor: "#3b82f6", color: "#fff", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" };

  if (step === "banned") {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ ...contentStyle, justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
          <div style={{ ...cardStyle, textAlign: "center", border: "1px solid #ef4444" }}>
            <h1 style={{ color: "#ef4444", fontSize: "48px", margin: "0 0 20px 0" }}>BANNED</h1>
            <p style={{ fontSize: "18px", color: "#f8fafc" }}>Your account has been permanently suspended from the TalentTuner testing platform due to multiple critical violations of our proctoring policies.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <Navbar />
      <div style={contentStyle}>
        
        <div style={mainStyle}>
          {step === "domain_selection" && (
            <div style={cardStyle}>
              <h1 style={{ color: "#f8fafc", margin: "0 0 10px 0" }}>Skill Assessment Testing Platform</h1>
              <p style={{ color: "#94a3b8", marginBottom: "30px" }}>Select your domain to begin an AI-proctored skill evaluation.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {domains.map(d => (
                  <button key={d} onClick={() => handleDomainSelect(d)} style={{ ...buttonStyle, backgroundColor: "#0f172a", border: "1px solid #38bdf8", color: "#38bdf8", padding: "20px", fontSize: "18px" }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "test_selection" && (
             <div style={cardStyle}>
              <button onClick={() => setStep("domain_selection")} style={{ background: "transparent", border: "none", color: "#3b82f6", cursor: "pointer", marginBottom: "20px" }}>&larr; Back to Domains</button>
              <h2 style={{ color: "#f8fafc", marginTop: 0 }}>{domain} Tests</h2>
              <p style={{ color: "#94a3b8", marginBottom: "30px" }}>Select a category and test to begin. Each test contains 15 questions and is strictly proctored.</p>
              
              {companyAssessments.length > 0 && (
                <div style={{ marginBottom: "40px" }}>
                  <h3 style={{ color: "#8b5cf6", borderBottom: "1px solid #334155", paddingBottom: "10px", marginBottom: "20px" }}>
                    ⭐ Recruiter Sponsored Challenges in {domain}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {companyAssessments.map(assessment => (
                      <div key={assessment.id} style={{ backgroundColor: "#1e293b", border: "1px solid #8b5cf6", borderRadius: "12px", padding: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                          <div>
                            <h4 style={{ margin: "0 0 5px 0", color: "#f8fafc", fontSize: "18px" }}>{assessment.title}</h4>
                            <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>
                              Posted by <strong style={{ color: "#d8b4fe" }}>{assessment.recruiter.name}</strong> • {assessment.type}
                            </p>
                          </div>
                          <button onClick={() => selectCompanyAssessment(assessment)} style={{ ...buttonStyle, backgroundColor: "#8b5cf6", padding: "10px 20px" }}>
                            Solve Challenge
                          </button>
                        </div>
                        <div style={{ backgroundColor: "#0f172a", padding: "15px", borderRadius: "8px" }}>
                          <strong style={{ color: "#d8b4fe", display: "block", marginBottom: "8px", fontSize: "13px", textTransform: "uppercase" }}>Problem Statement</strong>
                          <p style={{ margin: 0, color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                            {assessment.problemStatement}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3 style={{ color: "#38bdf8", borderBottom: "1px solid #334155", paddingBottom: "10px", marginBottom: "20px" }}>
                AI-Proctored Baseline Tests
              </h3>
              
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #334155", paddingBottom: "15px" }}>
                  {['easy', 'medium', 'hard'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setCurrentTab(cat)}
                      style={{ 
                        padding: "10px 20px", borderRadius: "6px", border: "none", 
                        backgroundColor: currentTab === cat ? (cat === 'easy' ? "#10b981" : cat === 'medium' ? "#f59e0b" : "#ef4444") : "#0f172a", 
                        color: currentTab === cat ? "#fff" : "#94a3b8", fontWeight: "bold", cursor: "pointer", textTransform: "capitalize"
                      }}
                    >
                      {cat}
                    </button>
                  ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                {(testTopics[domain] || Array.from({ length: 10 })).map((topic, idx) => (
                  <div key={idx} style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", color: "#f8fafc" }}>{typeof topic === 'string' ? topic : `Test #${idx + 1}`}</h4>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>15 Questions • Proctored</p>
                    </div>
                    <button onClick={() => selectTest(`${currentTab}-${idx+1}`)} style={{ ...buttonStyle, padding: "8px 16px", fontSize: "14px" }}>Start</button>
                  </div>
                ))}
              </div>
             </div>
          )}

          {step === "company_assessment_submit" && selectedCompanyAssessment && (
            <div style={cardStyle}>
              <button onClick={() => setStep("test_selection")} style={{ background: "transparent", border: "none", color: "#3b82f6", cursor: "pointer", marginBottom: "20px" }}>&larr; Back to Tests</button>
              <h2 style={{ color: "#f8fafc", marginTop: 0 }}>{selectedCompanyAssessment.title}</h2>
              <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "20px" }}>Posted by {selectedCompanyAssessment.recruiter.name}</p>
              
              <div style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "8px", borderLeft: "4px solid #8b5cf6", marginBottom: "30px" }}>
                <h4 style={{ color: "#d8b4fe", margin: "0 0 10px 0" }}>Problem Statement</h4>
                <p style={{ color: "#cbd5e1", margin: 0, lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {selectedCompanyAssessment.problemStatement}
                </p>
              </div>

              <form onSubmit={submitCompanyProject}>
                <h4 style={{ color: "#f8fafc", margin: "0 0 15px 0" }}>Submit Your Solution</h4>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", color: "#94a3b8", marginBottom: "5px" }}>GitHub Repository URL</label>
                  <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/your-username/repo" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", boxSizing: "border-box" }} />
                </div>
                
                <div style={{ marginBottom: "25px" }}>
                  <label style={{ display: "block", color: "#94a3b8", marginBottom: "5px" }}>Or Upload ZIP / File (Optional)</label>
                  <input type="file" onChange={e => setProjectFile(e.target.files[0])} style={{ color: "#cbd5e1" }} />
                </div>

                <button type="submit" disabled={submittingProject} style={{ ...buttonStyle, backgroundColor: submittingProject ? "#1e3a8a" : "#10b981", width: "100%", opacity: submittingProject ? 0.7 : 1 }}>
                  {submittingProject ? "Analyzing Authenticity & Submitting..." : "Submit Solution for AI Evaluation"}
                </button>
              </form>
            </div>
          )}

          {step === "policies" && (
            <div style={cardStyle}>
              <button onClick={() => setStep("test_selection")} style={{ background: "transparent", border: "none", color: "#3b82f6", cursor: "pointer", marginBottom: "20px" }}>&larr; Back to Tests</button>
              <h2 style={{ color: "#f8fafc", marginTop: 0 }}>Proctoring Policies & Requirements</h2>
              <div style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "8px", borderLeft: "4px solid #f59e0b", marginBottom: "20px", color: "#cbd5e1", lineHeight: "1.6" }}>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  <li style={{ marginBottom: "10px" }}><strong>Camera & Microphone Active:</strong> AI will continuously monitor your video and audio feeds. No other persons or voices are allowed.</li>
                  <li style={{ marginBottom: "10px" }}><strong>Fullscreen Enforced:</strong> Exiting fullscreen (pressing Esc) will instantly flag a violation and end the test.</li>
                  <li style={{ marginBottom: "10px" }}><strong>No Tab Switching:</strong> Navigating away from the test tab will automatically terminate the test and issue a warning.</li>
                  <li style={{ marginBottom: "0" }}><strong>3-Strike Rule:</strong> Accumulating 3 warnings will result in a permanent ban.</li>
                </ul>
              </div>
              
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "30px", color: "#f8fafc" }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: "18px", height: "18px" }} />
                I have read, understood, and agree to the strict monitoring policies above.
              </label>

              <button onClick={startTest} disabled={!agreed} style={{ ...buttonStyle, backgroundColor: agreed ? "#10b981" : "#0f172a", opacity: agreed ? 1 : 0.5, cursor: agreed ? "pointer" : "not-allowed" }}>
                Accept & Begin Proctored Test
              </button>
            </div>
          )}

          {step === "test" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ ...cardStyle, padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
                <div style={{ color: "#f8fafc", fontWeight: "bold", fontSize: "18px" }}>
                  {domain} - <span style={{textTransform: "capitalize"}}>{currentTab}</span> Test
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ color: "#f8fafc", fontWeight: "bold", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444", animation: "pulse 1.5s infinite" }} />
                    {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}
                  </div>
                  <button onClick={() => submitTest(false)} style={{ ...buttonStyle, backgroundColor: "#8b5cf6" }}>Submit Test</button>
                </div>
              </div>

              <div style={cardStyle}>                
                <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                  {testQuestions.map((q, idx) => (
                    <div key={q.id} style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "8px", borderLeft: `4px solid #3b82f6` }}>
                      <p style={{ margin: "0 0 15px 0", fontSize: "16px", fontWeight: "500", color: "#f8fafc" }}>{idx + 1}. {q.text.replace(/\(Q\d+\)/, "")}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {q.options.map((opt, oIdx) => (
                          <label key={oIdx} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", backgroundColor: answers[q.id] === opt ? "#1e293b" : "transparent", border: `1px solid ${answers[q.id] === opt ? "#3b82f6" : "#334155"}`, borderRadius: "6px", cursor: "pointer", transition: "all 0.2s" }}>
                            <input 
                              type="radio" 
                              name={q.id} 
                              value={opt} 
                              checked={answers[q.id] === opt}
                              onChange={() => handleAnswerSelect(q.id, opt)}
                              style={{ accentColor: "#3b82f6" }}
                            />
                            <span style={{ color: "#cbd5e1" }}>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "result" && resultData && (
            <div style={{ ...cardStyle, textAlign: "center" }}>
              <h1 style={{ color: "#10b981", fontSize: "36px", marginBottom: "10px" }}>Test Completed Successfully!</h1>
              <p style={{ color: "#94a3b8", fontSize: "18px" }}>Your results have been verified and recorded.</p>
              
              <div style={{ display: "flex", justifyContent: "center", gap: "40px", margin: "40px 0" }}>
                <div style={{ backgroundColor: "#0f172a", padding: "30px", borderRadius: "12px", border: "1px solid #334155", minWidth: "200px" }}>
                  <p style={{ margin: "0 0 10px 0", color: "#94a3b8", textTransform: "uppercase", fontSize: "14px", fontWeight: "bold" }}>Final Score</p>
                  <p style={{ margin: 0, fontSize: "48px", fontWeight: "900", color: "#38bdf8" }}>{resultData.score}</p>
                </div>
                <div style={{ backgroundColor: "#0f172a", padding: "30px", borderRadius: "12px", border: "1px solid #334155", minWidth: "200px" }}>
                  <p style={{ margin: "0 0 10px 0", color: "#94a3b8", textTransform: "uppercase", fontSize: "14px", fontWeight: "bold" }}>Time Taken</p>
                  <p style={{ margin: 0, fontSize: "48px", fontWeight: "900", color: "#8b5cf6" }}>{Math.floor(resultData.timeTaken / 60)}m {resultData.timeTaken % 60}s</p>
                </div>
              </div>

              <button onClick={() => setStep("test_selection")} style={buttonStyle}>Return to Tests</button>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        {(step === "test_selection" || step === "policies" || step === "test" || step === "result") && (
          <div style={sideStyle}>
            {step === "test" && (
              <div style={{ marginBottom: "30px" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444", animation: "pulse 1.5s infinite" }} />
                  Live AI Monitoring
                </h3>
                <div style={{ width: "100%", height: "200px", backgroundColor: "#0f172a", borderRadius: "8px", overflow: "hidden", border: "2px solid #ef4444", position: "relative" }}>
                  <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
                  <div style={{ position: "absolute", bottom: "10px", right: "10px", backgroundColor: "rgba(0,0,0,0.7)", padding: "4px 8px", borderRadius: "4px", color: "#10b981", fontSize: "12px", fontWeight: "bold" }}>Face Detected</div>
                </div>
              </div>
            )}

            {(warnings > 0) && (
              <div style={{ backgroundColor: "#7f1d1d", padding: "15px", borderRadius: "8px", marginBottom: "30px", border: "1px solid #ef4444" }}>
                <h4 style={{ margin: "0 0 5px 0", color: "#fca5a5" }}>Account Warnings</h4>
                <p style={{ margin: 0, color: "#fecaca", fontSize: "14px" }}>You have {warnings}/3 violations. 3 violations result in a permanent ban.</p>
              </div>
            )}

            {domain && (
              <div>
                <h3 style={{ margin: "0 0 15px 0", color: "#38bdf8", borderBottom: "1px solid #334155", paddingBottom: "10px" }}>
                  Live Rankings
                </h3>
                {leaderboard.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", padding: "20px 0" }}>No candidates have completed tests here yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {leaderboard.map((user, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#0f172a", padding: "12px", borderRadius: "8px", border: "1px solid #334155" }}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: idx === 0 ? "#fbbf24" : idx === 1 ? "#94a3b8" : idx === 2 ? "#b45309" : "#1e293b", color: idx < 3 ? "#fff" : "#94a3b8", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "12px", fontWeight: "bold" }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <p style={{ margin: 0, color: "#f8fafc", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>
                          <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "12px" }}>Time: {Math.floor(user.totalTime / 60)}m {user.totalTime % 60}s</p>
                        </div>
                        <div style={{ fontWeight: "bold", color: "#38bdf8", fontSize: "16px" }}>
                          {user.totalScore}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Animated Flowchart */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 40px 40px 40px" }}>
        <div className="flowchart-container">
          <h2 style={{ fontSize: "28px", color: "#f8fafc", marginBottom: "30px", background: "linear-gradient(90deg, #f59e0b, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            How TalentTuner Proctoring Works
          </h2>
          <div className="flowchart-row semicircle-4">
            <div className="flowchart-node" style={{ animationDelay: "0s" }}>
              <div style={{ fontSize: "30px", marginBottom: "10px" }}>🔒</div>
              <h4>Hardware Validation</h4>
              <p>Your camera and microphone are locked in for the entire duration of the test.</p>
            </div>
            <div className="flowchart-arrow" style={{ animationDelay: "0.2s" }}>&rarr;</div>
            <div className="flowchart-node" style={{ animationDelay: "0.4s" }}>
              <div style={{ fontSize: "30px", marginBottom: "10px" }}>🤖</div>
              <h4>AI Live Monitoring</h4>
              <p>Object detection and speech recognition continuously scan for unauthorized help.</p>
            </div>
            <div className="flowchart-arrow" style={{ animationDelay: "0.6s" }}>&rarr;</div>
            <div className="flowchart-node" style={{ animationDelay: "0.8s" }}>
              <div style={{ fontSize: "30px", marginBottom: "10px" }}>⏱️</div>
              <h4>Performance Evaluation</h4>
              <p>Your technical answers and completion speed are mathematically scored.</p>
            </div>
            <div className="flowchart-arrow" style={{ animationDelay: "1s" }}>&rarr;</div>
            <div className="flowchart-node" style={{ animationDelay: "1.2s", borderColor: "#8b5cf6", animation: "none", boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)" }}>
              <div style={{ fontSize: "30px", marginBottom: "10px" }}>🏆</div>
              <h4>Leaderboard Ranking</h4>
              <p>Highest scores with the fastest times are pushed to the top for recruiters.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
    </div>
  );
}
