const express = require("express");
const router = express.Router();
const multer = require("multer");
const resumeController = require("../controllers/resumeController");

// Use memory storage for parsing pdf directly from buffer
const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze", upload.single("resume"), resumeController.analyzeResume);

module.exports = router;
