const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "submission-" + req.user.id + "-" + uniqueSuffix + ".zip");
  }
});
const upload = multer({ storage: storage });

// Recruiter routes
router.post("/create", authMiddleware, assessmentController.createAssessment);
router.get("/recruiter", authMiddleware, assessmentController.getRecruiterAssessments);

// Job Seeker routes
router.get("/domain/:domain", authMiddleware, assessmentController.getAssessmentsByDomain);
router.post("/submit/:assessmentId", authMiddleware, upload.single("projectFile"), assessmentController.submitAssessment);

module.exports = router;
