const mongoose = require("mongoose");

const Project = require("../models/project.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const {
  analyzeProject,
} = require("../services/analyzer.service");

const runProjectAnalysis = catchAsync(
  async (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(
        new AppError("Invalid project ID", 400)
      );
    }

    const result = await analyzeProject({
      projectId,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Project analyzed successfully",
      analysisStatus: result.project.analysisStatus,
      analysis: result.project.analysis,
    });
  }
);

const getProjectAnalysis = catchAsync(
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
      "name description analysis analysisStatus analysisError"
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
        description: project.description,
        analysisStatus: project.analysisStatus,
        analysisError: project.analysisError,
        analysis: project.analysis,
      },
    });
  }
);

module.exports = {
  runProjectAnalysis,
  getProjectAnalysis,
};