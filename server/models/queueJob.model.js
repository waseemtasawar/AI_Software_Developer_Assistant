const mongoose = require("mongoose");

const queueJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    queueName: {
      type: String,
      required: true,
      index: true,
    },

    jobName: {
      type: String,
      required: true,
      index: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed",
      ],
      default: "waiting",
      index: true,
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    error: {
      type: String,
      default: null,
    },

    attemptsMade: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    failedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "QueueJob",
  queueJobSchema
);