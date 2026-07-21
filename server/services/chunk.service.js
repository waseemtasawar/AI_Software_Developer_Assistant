const mongoose = require("mongoose");

const File = require("../models/file.model");
const Chunk = require("../models/chunk.model");
const Project = require("../models/project.model");

const {splitCodeIntoChunks} = require("../utils/codeChunker");

const {shouldChunkFile} = require("../utils/chunkFileFilter");

const chunkProjectFiles = async ({
  projectId,
  userId,
  chunkSize = 120,
  overlap = 20,
}) => {
  const project = await Project.findOne({
    _id: projectId,
    user: userId,
  });

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  project.chunkingStatus = "processing";
  project.chunkingError = null;

  await project.save();

  const session = await mongoose.startSession();

  try {
    const files = await File.find({
      project: projectId,
      user: userId,
    }).lean();

    if (files.length === 0) {
      const error = new Error(
        "No files found for this project"
      );

      error.statusCode = 404;
      throw error;
    }

    const chunkDocuments = [];

    let chunkedFiles = 0;
    let skippedFiles = 0;
    let totalCharacters = 0;
    let estimatedTokens = 0;

    files.forEach((file) => {
      if (!shouldChunkFile(file)) {
        skippedFiles += 1;
        return;
      }

      const chunks = splitCodeIntoChunks(
        file.content,
        {
          chunkSize,
          overlap,
        }
      );

      if (chunks.length === 0) {
        skippedFiles += 1;
        return;
      }

      chunkedFiles += 1;

      chunks.forEach((chunk) => {
        totalCharacters += chunk.characterCount;
        estimatedTokens += chunk.estimatedTokenCount;

        chunkDocuments.push({
          project: projectId,
          file: file._id,
          user: userId,
          fileName: file.fileName,
          filePath: file.filePath,
          language: file.language || "Unknown",
          chunkIndex: chunk.chunkIndex,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
          content: chunk.content,
          characterCount: chunk.characterCount,
          estimatedTokenCount:
            chunk.estimatedTokenCount,
          embeddingStatus: "pending",
        });
      });
    });

    if (chunkDocuments.length === 0) {
      const error = new Error(
        "No supported source files were available for chunking"
      );

      error.statusCode = 400;
      throw error;
    }

    await session.withTransaction(async () => {
      await Chunk.deleteMany(
        {
          project: projectId,
          user: userId,
        },
        {
          session,
        }
      );

      await Chunk.insertMany(chunkDocuments, {
        session,
        ordered: true,
      });
    });

    project.chunkingStatus = "completed";
    project.chunkingError = null;

    project.chunkingStats = {
      totalChunks: chunkDocuments.length,
      chunkedFiles,
      skippedFiles,
      totalCharacters,
      estimatedTokens,
      chunkedAt: new Date(),
    };

    await project.save();

    return {
      projectId: project._id,
      totalChunks: chunkDocuments.length,
      chunkedFiles,
      skippedFiles,
      totalCharacters,
      estimatedTokens,
      chunkSize,
      overlap,
    };
  } catch (error) {
    project.chunkingStatus = "failed";
    project.chunkingError = error.message;

    await project.save();

    throw error;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  chunkProjectFiles,
};