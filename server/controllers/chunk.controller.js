const mongoose = require("mongoose");

const Chunk = require("../models/chunk.model");
const Project = require("../models/project.model");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const {chunkProjectFiles} = require("../services/chunk.service");

const runProjectChunking = catchAsync(
  async (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(
        new AppError("Invalid project ID", 400)
      );
    }

    const chunkSize = req.body.chunkSize || 120;
    const overlap = req.body.overlap || 20;

    const result = await chunkProjectFiles({
      projectId,
      userId: req.user._id,
      chunkSize,
      overlap,
    });

    return res.status(200).json({
      success: true,
      message: "Project chunked successfully",
      chunkingStatus: "completed",
      stats: result,
    });
  }
);

const getProjectChunks = catchAsync(
  async (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(
        new AppError("Invalid project ID", 400)
      );
    }

    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id,
    });

    if (!project) {
      return next(
        new AppError("Project not found", 404)
      );
    }

    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit, 10) || 20,
        1
      ),
      100
    );

    const skip = (page - 1) * limit;

    const filter = {
      project: projectId,
      user: req.user._id,
    };

    if (req.query.fileId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.query.fileId
        )
      ) {
        return next(
          new AppError("Invalid file ID", 400)
        );
      }

      filter.file = req.query.fileId;
    }

    const [chunks, totalChunks] = await Promise.all([
      Chunk.find(filter)
        .select("-content")
        .sort({
          filePath: 1,
          chunkIndex: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Chunk.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        totalChunks,
        totalPages: Math.ceil(
          totalChunks / limit
        ),
      },
      chunks,
    });
  }
);

const getSingleChunk = catchAsync(
  async (req, res, next) => {
    const { chunkId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chunkId)) {
      return next(
        new AppError("Invalid chunk ID", 400)
      );
    }

    const chunk = await Chunk.findOne({
      _id: chunkId,
      user: req.user._id,
    }).lean();

    if (!chunk) {
      return next(
        new AppError("Chunk not found", 404)
      );
    }

    return res.status(200).json({
      success: true,
      chunk,
    });
  }
);

const getChunkingStatus = catchAsync(
  async (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(
        new AppError("Invalid project ID", 400)
      );
    }

    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id,
    }).select(
      "name chunkingStatus chunkingError chunkingStats"
    );

    if (!project) {
      return next(
        new AppError("Project not found", 404)
      );
    }

    return res.status(200).json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        chunkingStatus: project.chunkingStatus,
        chunkingError: project.chunkingError,
        chunkingStats: project.chunkingStats,
      },
    });
  }
);

module.exports = {
  runProjectChunking,
  getProjectChunks,
  getSingleChunk,
  getChunkingStatus,
};