const File = require("../models/file.model");
const Project = require("../models/project.model");
const  detectLanguages = require("../utils/languageDetector");
const getPackageData = require("../utils/packageParser");
const   detectTechnologies = require("../utils/technologyDetector");
const detectPackageManager = require("../utils/packageManagerDetector");
const calculateStatistics = require("../utils/statsCalculator");
const buildFolderTree = require("../utils/folderTree");
const analyzeProject = async ({ projectId, userId }) => {
  const project = await Project.findOne({
    _id: projectId,
    user: userId,
  });

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  project.analysisStatus = "processing";
  project.analysisError = null;

  await project.save();

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

    const {
      primaryLanguage,
      languages,
    } = detectLanguages(files);

    const {
      packageJson,
      dependencies,
      devDependencies,
    } = getPackageData(files);

    const {
      frontend,
      backend,
      database,
      framework,
    } = detectTechnologies({
      dependencies,
      devDependencies,
      files,
    });

    const packageManager = detectPackageManager(files);

    const statistics = calculateStatistics(files);

    const folderTree = buildFolderTree(files);

    project.analysis = {
      primaryLanguage,
      languages,
      frontend,
      backend,
      framework,
      database,
      packageManager,
      dependencies,
      devDependencies,
      statistics,
      folderTree,
      analyzedAt: new Date(),
    };

    project.totalFiles = statistics.totalFiles;
    project.analysisStatus = "completed";
    project.analysisError = null;

    await project.save();

    return {
      project,
      packageJson,
    };
  } catch (error) {
    project.analysisStatus = "failed";
    project.analysisError = error.message;

    await project.save();

    throw error;
  }
};

module.exports = {
  analyzeProject,
};