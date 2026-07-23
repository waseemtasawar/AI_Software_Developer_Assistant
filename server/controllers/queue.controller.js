const mongoose = require("mongoose");

const Project = require("../models/project.model");
const QueueJob = require("../models/queueJob.model");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const {
  QUEUE_NAMES,
  JOB_NAMES,
} = require("../constants/queueNames");

const {
  addChunkProjectJob,
} = require("../queues/project.queue");

const queueProjectChunking = catchAsync(
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

    const chunkSize =
      Number.parseInt(req.body.chunkSize, 10) || 120;

    const overlap =
      Number.parseInt(req.body.overlap, 10) || 20;

    if (chunkSize < 20 || chunkSize > 500) {
      return next(
        new AppError(
          "Chunk size must be between 20 and 500 lines",
          400
        )
      );
    }

    if (overlap < 0 || overlap >= chunkSize) {
      return next(
        new AppError(
          "Overlap must be zero or greater and smaller than chunk size",
          400
        )
      );
    }

    const existingJob = await QueueJob.findOne({
      project: projectId,
      user: req.user._id,
      jobName: JOB_NAMES.CHUNK_PROJECT,
      status: {
        $in: ["waiting", "active", "delayed"],
      },
    });

    if (existingJob) {
      return res.status(200).json({
        success: true,
        message: "Project chunking is already queued",
        job: {
          id: existingJob.jobId,
          status: existingJob.status,
          progress: existingJob.progress,
        },
      });
    }

    project.chunkingStatus = "processing";
    project.chunkingError = null;

    await project.save();

    const job = await addChunkProjectJob({
      projectId,
      userId: req.user._id,
      chunkSize,
      overlap,
    });

    const queueJob = await QueueJob.findOneAndUpdate(
      {
        jobId: job.id,
      },
      {
        jobId: job.id,
        queueName: QUEUE_NAMES.PROJECT_PROCESSING,
        jobName: JOB_NAMES.CHUNK_PROJECT,
        project: projectId,
        user: req.user._id,
        status: "waiting",
        progress: 0,
        error: null,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(202).json({
      success: true,
      message: "Project chunking job queued",
      job: {
        id: queueJob.jobId,
        status: queueJob.status,
        progress: queueJob.progress,
      },
    });
  }
);

const getQueueJobStatus = catchAsync(
  async (req, res, next) => {
    const queueJob = await QueueJob.findOne({
      jobId: req.params.jobId,
      user: req.user._id,
    }).lean();

    if (!queueJob) {
      return next(
        new AppError("Queue job not found", 404)
      );
    }

    return res.status(200).json({
      success: true,
      job: {
        id: queueJob.jobId,
        name: queueJob.jobName,
        status: queueJob.status,
        progress: queueJob.progress,
        result: queueJob.result,
        error: queueJob.error,
        attemptsMade: queueJob.attemptsMade,
        createdAt: queueJob.createdAt,
        startedAt: queueJob.startedAt,
        completedAt: queueJob.completedAt,
        failedAt: queueJob.failedAt,
      },
    });
  }
);

const getProjectJobs = catchAsync(
  async (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(
        new AppError("Invalid project ID", 400)
      );
    }

    const project = await Project.exists({
      _id: projectId,
      user: req.user._id,
    });

    if (!project) {
      return next(
        new AppError("Project not found", 404)
      );
    }

    const jobs = await QueueJob.find({
      project: projectId,
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  }
);

module.exports = {
  queueProjectChunking,
  getQueueJobStatus,
  getProjectJobs,
};