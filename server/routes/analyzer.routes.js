const express = require("express");

const {
  runProjectAnalysis,
  getProjectAnalysis,
} = require("../controllers/analyzer.controller");

const {
  protect,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/:projectId/analyze", runProjectAnalysis);

router.get("/:projectId/analysis", getProjectAnalysis);

module.exports = router;