require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const jobRoutes = require("./routes/jobRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const profileRoutes = require("./routes/profileRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");

const app = express();

const path = require("path");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use("/api/jobs", jobRoutes);

const githubRoutes = require("./routes/githubRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");

app.use("/api/github", githubRoutes);
app.use("/api/recruiters", recruiterRoutes);

app.use("/api/resume", resumeRoutes);

const testRoutes = require("./routes/testRoutes");
app.use("/api/tests", testRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/assessments", assessmentRoutes);
