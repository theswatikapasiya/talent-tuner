const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const jobController = require("../controllers/jobController");

router.get("/insights", authMiddleware, jobController.getInsights);
router.post("/search", authMiddleware, jobController.searchJobs);

// Recruiter routes
router.post("/", authMiddleware, jobController.createJob);
router.get("/recruiter", authMiddleware, jobController.getRecruiterJobs);

// Candidate route
router.post("/apply/:jobId", authMiddleware, jobController.applyJob);

module.exports = router;