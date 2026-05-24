import React, { useState, useEffect } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newGithubUrl, setNewGithubUrl] = useState("");
  const [newTechStack, setNewTechStack] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/projects/my-projects");
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load your projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newTitle || !newGithubUrl) return;
    
    setCreateLoading(true);
    setCreateError("");
    setCreateSuccess("");
    try {
      await api.post("/api/projects", {
        title: newTitle,
        githubUrl: newGithubUrl,
        techStack: newTechStack || "Not specified"
      });
      
      // Reset form and close modal
      setNewTitle("");
      setNewGithubUrl("");
      setNewTechStack("");
      setCreateSuccess("Project created successfully!");
      setTimeout(() => {
        setShowModal(false);
        setCreateSuccess("");
      }, 1500);
      
      // Refresh project list
      fetchProjects();
    } catch (err) {
      console.error(err);
      setCreateError(err.response?.data?.error || "Failed to create project");
    } finally {
      setCreateLoading(false);
    }
  };

  // UI Styles
  const pageStyle = { minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0", fontFamily: "Inter, sans-serif" };
  const contentStyle = { padding: "40px", maxWidth: "1200px", margin: "0 auto" };
  const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "20px", marginBottom: "30px" };
  const titleStyle = { margin: 0, fontSize: "32px", color: "#f8fafc" };
  const primaryButtonStyle = { padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#3b82f6", color: "#fff", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" };
  const secondaryButtonStyle = { ...primaryButtonStyle, backgroundColor: "#334155", color: "#cbd5e1" };
  
  const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" };
  const cardStyle = { backgroundColor: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", transition: "transform 0.2s, borderColor 0.2s" };
  const cardTitleStyle = { margin: "0 0 10px 0", color: "#38bdf8", fontSize: "20px" };
  const cardTextStyle = { margin: "0 0 15px 0", color: "#94a3b8", lineHeight: "1.5", flexGrow: 1 };
  
  const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
  const modalStyle = { backgroundColor: "#1e293b", padding: "30px", borderRadius: "12px", width: "100%", maxWidth: "450px", border: "1px solid #334155", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)" };
  const inputStyle = { padding: "12px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", outline: "none", width: "100%", boxSizing: "border-box", marginBottom: "15px" };

  return (
    <div style={pageStyle}>
      <Navbar />
      
      {/* CSS for hover effects */}
      <style>{`
        .project-card:hover { transform: translateY(-5px); border-color: #3b82f6; }
      `}</style>

      <div style={contentStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>My Projects</h1>
          <button style={primaryButtonStyle} onClick={() => setShowModal(true)}>+ New Project</button>
        </div>

        {error && <p style={{ color: "#ef4444", textAlign: "center", padding: "20px" }}>{error}</p>}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{ display: "inline-block", width: "40px", height: "40px", border: "3px solid #334155", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "#94a3b8", marginTop: "15px" }}>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", backgroundColor: "#1e293b", borderRadius: "12px", border: "1px dashed #334155" }}>
            <h3 style={{ color: "#e2e8f0", marginBottom: "10px" }}>No projects tracked yet</h3>
            <p style={{ color: "#94a3b8", marginBottom: "20px", fontSize: "15px" }}>
              Run the <a href="/analyzer" style={{color: "#38bdf8", textDecoration: "none"}}>AI Analyzer</a> on your GitHub repositories to automatically generate rich project intelligence, or create one manually below.
            </p>
            <button style={primaryButtonStyle} onClick={() => setShowModal(true)}>Create Project</button>
          </div>
        ) : (
          <div style={gridStyle}>
            {projects.map((project) => (
              <div key={project.id} style={cardStyle} className="project-card">
                <h3 style={cardTitleStyle}>{project.title}</h3>
                <p style={cardTextStyle}>{project.techStack}</p>
                
                <div style={{ borderTop: "1px solid #334155", paddingTop: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}>
                    View GitHub ↗
                  </a>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    {new Date(project.createdAt).toLocaleDateString() || "Recently"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ color: "#f8fafc", marginTop: 0, marginBottom: "20px" }}>Add New Project</h2>
            <form onSubmit={handleCreateProject}>
              <input 
                type="text" 
                placeholder="Project Title" 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
                style={inputStyle} 
                required 
              />
              <input 
                type="url" 
                placeholder="GitHub Repository URL" 
                value={newGithubUrl} 
                onChange={(e) => setNewGithubUrl(e.target.value)} 
                style={inputStyle} 
                required 
              />
              <textarea 
                placeholder="Description / Tech Stack" 
                value={newTechStack} 
                onChange={(e) => setNewTechStack(e.target.value)} 
                style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} 
              />
              
              {createError && <p style={{ color: "#ef4444", fontSize: "14px", margin: "0 0 10px 0" }}>{createError}</p>}
              {createSuccess && <p style={{ color: "#10b981", fontSize: "14px", margin: "0 0 10px 0" }}>{createSuccess}</p>}
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" style={secondaryButtonStyle} onClick={() => setShowModal(false)} disabled={createLoading}>
                  Cancel
                </button>
                <button type="submit" style={createLoading ? { ...primaryButtonStyle, opacity: 0.7 } : primaryButtonStyle} disabled={createLoading}>
                  {createLoading ? "Saving..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
