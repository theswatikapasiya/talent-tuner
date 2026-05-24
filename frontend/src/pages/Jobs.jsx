import React, { useState, useEffect } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";

export default function JobSearch() {
  const [insights, setInsights] = useState(null);
  const [searchParams, setSearchParams] = useState({
    role: "",
    location: "",
    experience: "All Levels",
    salary: "All Ranges",
    jobType: "All Types"
  });
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get("/api/jobs/insights");
        setInsights(res.data);
      } catch (err) {
        console.error("Failed to load insights", err);
      }
    };
    fetchInsights();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setJobs([]);
    try {
      const res = await api.post("/api/jobs/search", searchParams);
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Failed to search jobs", err);
    }
    setLoading(false);
  };

  const applyInternalJob = async (jobId) => {
    try {
      await api.post(`/api/jobs/apply/${jobId}`);
      alert("Application successfully submitted!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to apply");
    }
  };

  const getSourceColor = (source) => {
    if (source.includes("LinkedIn")) return "#0a66c2";
    if (source.includes("Naukri")) return "#2764ba";
    if (source.includes("Indeed")) return "#2557a7";
    if (source.includes("Foundit") || source.includes("Unstop")) return "#6366f1";
    return "#10b981";
  };

  return (
    <div style={{ backgroundColor: "transparent", minHeight: "100vh", color: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* Header section */}
        <div style={{ marginBottom: "40px", textAlign: "center", padding: "40px 0" }}>
          <h1 style={{ fontSize: "48px", fontWeight: "800", margin: "0 0 15px 0", background: "linear-gradient(90deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Make it into the right place, work where your skills are valued.
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "20px", margin: 0, fontWeight: "500" }}>Find your right space • Save your time • Work smartly</p>
        </div>

        {/* Real-time Insights */}
        {insights && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "40px" }}>
            <div style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b" }}>
              <h3 style={{ color: "#3b82f6", fontSize: "18px", margin: "0 0 15px 0" }}>🚀 Trending Skills</h3>
              {insights.trendingSkills.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
                  <span>{s.name}</span>
                  <span style={{ color: "#10b981", fontWeight: "600" }}>{s.growth}</span>
                </div>
              ))}
            </div>
            
            <div style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b" }}>
              <h3 style={{ color: "#8b5cf6", fontSize: "18px", margin: "0 0 15px 0" }}>📍 Top Locations</h3>
              {insights.topLocations.map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
                  <span>{l.name}</span>
                  <span style={{ color: "#cbd5e1" }}>{l.activeJobs} Jobs</span>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b" }}>
              <h3 style={{ color: "#10b981", fontSize: "18px", margin: "0 0 15px 0" }}>💰 Salary Insights</h3>
              {insights.salaryInsights.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
                  <span>{s.role}</span>
                  <span style={{ color: "#cbd5e1" }}>{s.avg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Search Portal */}
        <div style={{ marginBottom: "15px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>Find your dream job</h2>
        </div>
        <div style={{ backgroundColor: "#0f172a", padding: "30px", borderRadius: "16px", border: "1px solid #1e293b", marginBottom: "40px" }}>
          <form onSubmit={handleSearch}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#e2e8f0" }}>Job Title / Skills</label>
                <input 
                  type="text"
                  placeholder="e.g. Software Engineer, Data Scientist"
                  value={searchParams.role}
                  onChange={e => setSearchParams({...searchParams, role: e.target.value})}
                  style={{ width: "100%", padding: "14px", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "16px", outline: "none" }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#e2e8f0" }}>Location</label>
                <input 
                  type="text"
                  placeholder="e.g. Bangalore, Karnataka or Remote"
                  value={searchParams.location}
                  onChange={e => setSearchParams({...searchParams, location: e.target.value})}
                  style={{ width: "100%", padding: "14px", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "16px", outline: "none" }}
                />
              </div>
            </div>

            {/* Advanced Filters Accordion */}
            <div style={{ border: "1px solid #334155", borderRadius: "8px", marginBottom: "20px", overflow: "hidden" }}>
              <div 
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                style={{ padding: "15px", backgroundColor: "#1e293b", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontWeight: "500", borderBottom: isAdvancedOpen ? "1px solid #334155" : "none" }}
              >
                <span>{isAdvancedOpen ? "v" : ">"}</span>
                <span>🎯 Advanced Filters</span>
              </div>
              
              {isAdvancedOpen && (
                <div style={{ padding: "20px", backgroundColor: "#0f172a", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#e2e8f0" }}>Experience Level</label>
                    <select value={searchParams.experience} onChange={e => setSearchParams({...searchParams, experience: e.target.value})} style={{ width: "100%", padding: "12px", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff", outline: "none" }}>
                      <option>All Levels</option>
                      <option>Entry Level</option>
                      <option>Mid Level</option>
                      <option>Senior Level</option>
                      <option>Executive</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#e2e8f0" }}>Salary Range</label>
                    <select value={searchParams.salary} onChange={e => setSearchParams({...searchParams, salary: e.target.value})} style={{ width: "100%", padding: "12px", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff", outline: "none" }}>
                      <option>All Ranges</option>
                      <option>$0 - $50k</option>
                      <option>$50k - $100k</option>
                      <option>$100k - $150k</option>
                      <option>$150k+</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#e2e8f0" }}>Job Type</label>
                    <select value={searchParams.jobType} onChange={e => setSearchParams({...searchParams, jobType: e.target.value})} style={{ width: "100%", padding: "12px", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff", outline: "none" }}>
                      <option>All Types</option>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Freelance</option>
                      <option>Internship</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" style={{ width: "100%", padding: "16px", backgroundColor: "#06b6d4", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e)=>e.target.style.backgroundColor="#0891b2"} onMouseOut={(e)=>e.target.style.backgroundColor="#06b6d4"}>
              {loading ? "SCRAPING WEB..." : "SEARCH JOBS"}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {jobs.length > 0 && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px" }}>Real-World Job Opportunities ({jobs.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {jobs.map(job => (
                <div key={job.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b", transition: "transform 0.2s", cursor: "pointer" }} onMouseOver={(e)=>e.currentTarget.style.transform="translateY(-2px)"} onMouseOut={(e)=>e.currentTarget.style.transform="translateY(0)"}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <h3 style={{ margin: 0, fontSize: "20px", color: "#f8fafc" }}>{job.title}</h3>
                      <span style={{ padding: "4px 10px", backgroundColor: `${getSourceColor(job.source)}20`, color: getSourceColor(job.source), borderRadius: "20px", fontSize: "12px", fontWeight: "600", border: `1px solid ${getSourceColor(job.source)}50` }}>
                        {job.source}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", color: "#94a3b8", fontSize: "14px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>🏢 {job.company}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>📍 {job.location}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>💼 {job.type}</span>
                    </div>
                  </div>
                  <div>
                    {job.isInternal ? (
                      <button onClick={() => applyInternalJob(job.id)} style={{ border: "none", cursor: "pointer", padding: "10px 20px", backgroundColor: "#10b981", color: "#fff", borderRadius: "6px", fontWeight: "600", fontSize: "14px", transition: "all 0.2s" }} onMouseOver={(e)=>e.target.style.backgroundColor="#059669"} onMouseOut={(e)=>e.target.style.backgroundColor="#10b981"}>
                        Fast Apply
                      </button>
                    ) : (
                      <a href={job.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", padding: "10px 20px", backgroundColor: "#3b82f6", color: "#fff", borderRadius: "6px", fontWeight: "600", fontSize: "14px" }}>External Apply</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Companies Section */}
        {insights && insights.featuredCompanies && (
          <div style={{ marginTop: "60px", borderTop: "1px solid #1e293b", paddingTop: "40px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#f8fafc", marginBottom: "30px", textAlign: "center" }}>🏢 Featured Companies</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px" }}>
              
              {/* Column 1 */}
              <div style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
                <h3 style={{ color: "#38bdf8", borderBottom: "1px solid #1e293b", paddingBottom: "10px", marginBottom: "15px", fontSize: "18px" }}>All Companies</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {insights.featuredCompanies.all.map((c, i) => (
                    <div key={i} style={{ borderBottom: i !== insights.featuredCompanies.all.length - 1 ? "1px solid #1e293b" : "none", paddingBottom: i !== insights.featuredCompanies.all.length - 1 ? "10px" : "0" }}>
                      <a href={c.url} target="_blank" rel="noreferrer" style={{ fontWeight: "600", fontSize: "16px", color: "#f8fafc", textDecoration: "none" }} onMouseOver={(e)=>e.target.style.color="#38bdf8"} onMouseOut={(e)=>e.target.style.color="#f8fafc"}>{c.name}</a>
                      <div style={{ fontSize: "12px", color: "#38bdf8", marginTop: "2px", marginBottom: "6px" }}>
                        <a href={c.url} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{c.domain} ↗</a>
                      </div>
                      <div style={{ fontSize: "13px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                        <span>📍 {c.location}</span>
                        <span style={{ color: "#10b981" }}>{c.hiring}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2 */}
              <div style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
                <h3 style={{ color: "#818cf8", borderBottom: "1px solid #1e293b", paddingBottom: "10px", marginBottom: "15px", fontSize: "18px" }}>Tech Giants</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {insights.featuredCompanies.techGiants.map((c, i) => (
                    <div key={i} style={{ borderBottom: i !== insights.featuredCompanies.techGiants.length - 1 ? "1px solid #1e293b" : "none", paddingBottom: i !== insights.featuredCompanies.techGiants.length - 1 ? "10px" : "0" }}>
                      <a href={c.url} target="_blank" rel="noreferrer" style={{ fontWeight: "600", fontSize: "16px", color: "#f8fafc", textDecoration: "none" }} onMouseOver={(e)=>e.target.style.color="#818cf8"} onMouseOut={(e)=>e.target.style.color="#f8fafc"}>{c.name}</a>
                      <div style={{ fontSize: "12px", color: "#818cf8", marginTop: "2px", marginBottom: "6px" }}>
                        <a href={c.url} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{c.domain} ↗</a>
                      </div>
                      <div style={{ fontSize: "13px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                        <span>📍 {c.location}</span>
                        <span style={{ color: "#10b981" }}>{c.hiring}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3 */}
              <div style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
                <h3 style={{ color: "#f472b6", borderBottom: "1px solid #1e293b", paddingBottom: "10px", marginBottom: "15px", fontSize: "18px" }}>Indian Tech</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {insights.featuredCompanies.indianTech.map((c, i) => (
                    <div key={i} style={{ borderBottom: i !== insights.featuredCompanies.indianTech.length - 1 ? "1px solid #1e293b" : "none", paddingBottom: i !== insights.featuredCompanies.indianTech.length - 1 ? "10px" : "0" }}>
                      <a href={c.url} target="_blank" rel="noreferrer" style={{ fontWeight: "600", fontSize: "16px", color: "#f8fafc", textDecoration: "none" }} onMouseOver={(e)=>e.target.style.color="#f472b6"} onMouseOut={(e)=>e.target.style.color="#f8fafc"}>{c.name}</a>
                      <div style={{ fontSize: "12px", color: "#f472b6", marginTop: "2px", marginBottom: "6px" }}>
                        <a href={c.url} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{c.domain} ↗</a>
                      </div>
                      <div style={{ fontSize: "13px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                        <span>📍 {c.location}</span>
                        <span style={{ color: "#10b981" }}>{c.hiring}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 4 */}
              <div style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
                <h3 style={{ color: "#10b981", borderBottom: "1px solid #1e293b", paddingBottom: "10px", marginBottom: "15px", fontSize: "18px" }}>Global Corps</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {insights.featuredCompanies.globalCorps.map((c, i) => (
                    <div key={i} style={{ borderBottom: i !== insights.featuredCompanies.globalCorps.length - 1 ? "1px solid #1e293b" : "none", paddingBottom: i !== insights.featuredCompanies.globalCorps.length - 1 ? "10px" : "0" }}>
                      <a href={c.url} target="_blank" rel="noreferrer" style={{ fontWeight: "600", fontSize: "16px", color: "#f8fafc", textDecoration: "none" }} onMouseOver={(e)=>e.target.style.color="#10b981"} onMouseOut={(e)=>e.target.style.color="#f8fafc"}>{c.name}</a>
                      <div style={{ fontSize: "12px", color: "#10b981", marginTop: "2px", marginBottom: "6px" }}>
                        <a href={c.url} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{c.domain} ↗</a>
                      </div>
                      <div style={{ fontSize: "13px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                        <span>📍 {c.location}</span>
                        <span style={{ color: "#10b981" }}>{c.hiring}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
        {/* Animated Flowchart */}
        <div className="flowchart-container">
          <h2 style={{ fontSize: "28px", color: "#f8fafc", marginBottom: "30px", background: "linear-gradient(90deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            How Intelligent Job Matching Works
          </h2>
          <div className="flowchart-row semicircle-3">
            <div className="flowchart-node" style={{ animationDelay: "0s" }}>
              <div style={{ fontSize: "30px", marginBottom: "10px" }}>🌐</div>
              <h4>Real-Time Scraping</h4>
              <p>We index jobs across top networks and corporate portals instantly.</p>
            </div>
            <div className="flowchart-arrow" style={{ animationDelay: "0.2s" }}>&rarr;</div>
            <div className="flowchart-node" style={{ animationDelay: "0.4s" }}>
              <div style={{ fontSize: "30px", marginBottom: "10px" }}>🧠</div>
              <h4>AI Skill Mapping</h4>
              <p>Your authenticated intelligence profile is mapped to precise job requirements.</p>
            </div>
            <div className="flowchart-arrow" style={{ animationDelay: "0.6s" }}>&rarr;</div>
            <div className="flowchart-node" style={{ animationDelay: "0.8s", borderColor: "#10b981", animation: "none", boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)" }}>
              <div style={{ fontSize: "30px", marginBottom: "10px" }}>⚡</div>
              <h4>Merit Application</h4>
              <p>1-Click direct apply using your cryptographically verified merit profile.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
