const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      default: "Unknown",
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    startLine: {
      type: Number,
      required: true,
    },

    endLine: {
      type: Number,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    characterCount: {
      type: Number,
      default: 0,
    },

    estimatedTokenCount: {
      type: Number,
      default: 0,
    },

    embeddingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    embeddingError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

chunkSchema.index(
  {
    project: 1,
    file: 1,
    chunkIndex: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Chunk", chunkSchema);