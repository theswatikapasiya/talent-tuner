const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, req.user.id + "-" + uniqueSuffix + ".pdf");
  }
});
const upload = multer({ storage: storage });

router.get("/", authMiddleware, profileController.getProfile);
router.post("/analyze", authMiddleware, profileController.analyzeProfile);
router.post("/upload-resume", authMiddleware, upload.single("resume"), profileController.uploadResume);

module.exports = router;
