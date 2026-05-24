const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");
const authMiddleware = require("../middleware/authMiddleware");

// All test routes require authentication
router.use(authMiddleware);

router.get("/generate", testController.generateTests);
router.post("/result", testController.submitResult);
router.get("/leaderboard", testController.getLeaderboard);
router.get("/status", testController.checkStatus);

module.exports = router;
