const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const projectController = require("../controllers/projectController");

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});

router.post("/", authMiddleware, projectController.createProject);
router.get("/my-projects", authMiddleware, projectController.getMyProjects);


module.exports = router;