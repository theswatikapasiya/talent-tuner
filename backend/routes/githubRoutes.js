// const express = require("express");
// const router = express.Router();

// const githubController = require("../controllers/githubController");
// const authMiddleware = require("../middleware/authMiddleware");

// router.post("/analyze", authMiddleware, githubController.analyzeRepo);

// module.exports = router;

const express = require("express");
const router = express.Router();

const githubController = require("../controllers/githubController");

router.post("/analyze", githubController.analyzeRepo);

module.exports = router;
