const express = require("express");

const {
  runProjectChunking,
  getProjectChunks,
  getSingleChunk,
  getChunkingStatus,
} = require("../controllers/chunk.controller");

const {
  protect,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.post(
  "/projects/:projectId/chunk",
  runProjectChunking
);

router.get(
  "/projects/:projectId/chunks",
  getProjectChunks
);

router.get(
  "/projects/:projectId/status",
  getChunkingStatus
);

router.get(
  "/chunks/:chunkId",
  getSingleChunk
);

module.exports = router;