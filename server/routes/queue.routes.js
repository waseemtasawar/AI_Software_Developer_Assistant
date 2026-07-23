const express = require("express");

const {
  queueProjectChunking,
  getQueueJobStatus,
  getProjectJobs,
} = require("../controllers/queue.controller");

const {protect} = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);


router.post(
  "/projects/:projectId/chunk",
  queueProjectChunking
);

router.get(
  "/projects/:projectId/jobs",
  getProjectJobs
);

router.get(
  "/jobs/:jobId",
  getQueueJobStatus
);

module.exports = router;