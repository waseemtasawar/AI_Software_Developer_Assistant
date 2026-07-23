require("dotenv").config();

const mongoose = require("mongoose");
const { Worker } = require("bullmq");

const QueueJob = require("../models/queueJob.model");
const connectDB = require("../config/db");
const  createRedisConnection = require("../config/redis");

const {
  QUEUE_NAMES,
  JOB_NAMES,
} = require("../constants/queueNames");

const {
  chunkProjectFiles,
} = require("../services/chunk.service");


const processJob = async (job) => {
  const {
    projectId,
    userId,
    chunkSize,
    overlap,
  } = job.data;

  await QueueJob.findOneAndUpdate(
    {
      jobId: job.id,
    },
    {
      status: "active",
      startedAt: new Date(),
      attemptsMade: job.attemptsMade,
      error: null,
    }
  );

  switch (job.name) {
    case JOB_NAMES.CHUNK_PROJECT: {
      return chunkProjectFiles({
        projectId,
        userId,
        chunkSize,
        overlap,

        onProgress: async (progress) => {
          await job.updateProgress(progress);

          await QueueJob.findOneAndUpdate(
            {
              jobId: job.id,
            },
            {
              progress,
              status: "active",
            }
          );
        },
      });
    }

    default:
      throw new Error(
        `Unsupported job type: ${job.name}`
      );
  }
};

const startWorker = async () => {
  await connectDB();

  const worker = new Worker(
    QUEUE_NAMES.PROJECT_PROCESSING,
    processJob,
    {
      connection: createRedisConnection(),

      /*
       * Number of jobs handled simultaneously by this worker.
       * Keep this low while processing large repositories.
       */
      concurrency: 2,
    }
  );

  worker.on("ready", () => {
    console.log("Project worker is ready");
  });

  worker.on("active", (job) => {
    console.log(
      `Job ${job.id} started: ${job.name}`
    );
  });

  worker.on("progress", (job, progress) => {
    console.log(
      `Job ${job.id} progress: ${progress}%`
    );
  });

  worker.on("completed", async (job, result) => {
    console.log(`Job ${job.id} completed`);

    await QueueJob.findOneAndUpdate(
      {
        jobId: job.id,
      },
      {
        status: "completed",
        progress: 100,
        result,
        error: null,
        completedAt: new Date(),
        attemptsMade: job.attemptsMade,
      }
    );
  });

  worker.on("failed", async (job, error) => {
    console.error(
      `Job ${job?.id || "unknown"} failed:`,
      error.message
    );

    if (!job) {
      return;
    }

    await QueueJob.findOneAndUpdate(
      {
        jobId: job.id,
      },
      {
        status: "failed",
        error: error.message,
        failedAt: new Date(),
        attemptsMade: job.attemptsMade,
      }
    );
  });

  worker.on("error", (error) => {
    console.error("Worker error:", error);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Closing worker...`);

    await worker.close();
    await mongoose.connection.close();

    process.exit(0);startWorker
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startWorker().catch((error) => {
  console.error(
    "Could not start project worker:",
    error
  );

  process.exit(1);
});
