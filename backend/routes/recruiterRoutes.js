const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");

// Get all candidates and their projects
router.get("/candidates", authMiddleware, async (req, res) => {
  try {
    // Check if user is a recruiter
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Access denied. Recruiters only." });
    }

    // Fetch candidates and aggregate their public intelligence
    const candidates = await prisma.user.findMany({
      where: { role: "candidate" },
      select: {
        id: true,
        name: true,
        email: true,
        projects: {
          select: {
            id: true,
            title: true,
            githubUrl: true,
            techStack: true,
            score: true,
            createdAt: true
          }
        }
      }
    });

    res.json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get recruiter dashboard profile & stats
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Access denied." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        companyProfile: true,
        jobs: { include: { applications: true } },
        assessments: { include: { submissions: true } }
      }
    });

    if (!user) return res.status(404).json({ error: "Recruiter not found." });

    const totalJobs = user.jobs.length;
    const totalJobApplicants = user.jobs.reduce((acc, job) => acc + job.applications.length, 0);

    const totalAssessments = user.assessments.length;
    const totalSubmissions = user.assessments.reduce((acc, a) => acc + a.submissions.length, 0);

    res.json({
      name: user.name,
      email: user.email,
      profile: user.companyProfile || {},
      stats: {
        totalJobs,
        totalJobApplicants,
        totalAssessments,
        totalSubmissions
      }
    });
  } catch (error) {
    console.error("Fetch recruiter profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update recruiter profile
router.post("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Access denied." });
    }

    const { companyName, location, website, linkedinUrl, xUrl, description, notificationsOn } = req.body;

    const profile = await prisma.companyProfile.upsert({
      where: { userId: req.user.id },
      update: { companyName, location, website, linkedinUrl, xUrl, description, notificationsOn },
      create: {
        userId: req.user.id,
        companyName,
        location,
        website,
        linkedinUrl,
        xUrl,
        description,
        notificationsOn: notificationsOn !== undefined ? notificationsOn : true
      }
    });

    res.json({ success: true, profile });
  } catch (error) {
    console.error("Update recruiter profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get intelligence (leaderboard) by domain
router.get("/intelligence/:domain", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Access denied." });
    }
    const { domain } = req.params;

    const results = await prisma.testResult.findMany({
      where: { domain, status: "completed" },
      include: {
        user: {
          include: {
            profile: true,
            testResults: true
          }
        }
      },
      orderBy: [
        { score: 'desc' },
        { timeTaken: 'asc' }
      ]
    });

    const userScores = {};
    results.forEach(r => {
      if (!userScores[r.userId]) {
        userScores[r.userId] = {
          candidate: r.user,
          totalScore: 0,
          totalTime: 0,
          testsCompleted: 0
        };
      }
      userScores[r.userId].totalScore += r.score;
      userScores[r.userId].totalTime += r.timeTaken;
      userScores[r.userId].testsCompleted += 1;
    });

    const leaderboard = Object.values(userScores).sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.totalTime - b.totalTime;
    });

    res.json(leaderboard);
  } catch (error) {
    console.error("Fetch intelligence error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
