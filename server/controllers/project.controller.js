const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const appError = require('../utils/appError');
const Project = require('../models/project.model');
const File = require('../models/file.model');
const { extractZipFile} = require('../services/zip.service');
const catchAsync = require('../utils/catchAsync');  

// Upload project controller
const uploadProject = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  if (!req.file) {
    return next(new AppError("Please provide a ZIP file", 400));
  }

  const projectName =
    name || path.parse(req.file.originalname).name;

  const project = await Project.create({
    user: req.user._id,
    name: projectName,
    description: description || "",
    originalFileName: req.file.originalname,
    status: "processing",
  });

  try {
    const extractedFiles = extractZipFile(req.file.path);

    const filesToSave = extractedFiles.map((file) => {
      const filePath =
        file.filePath ||
        file.path ||
        file.entryName ||
        "";

      const fileName =
        file.fileName ||
        file.name ||
        path.basename(filePath);

      return {
        project: project._id,
        user: req.user._id,
        fileName,
        filePath,
        extension:
          file.extension ||
          path.extname(fileName).toLowerCase(),
        language: file.language || "Unknown",
        content: file.content || "",
        size:
          file.size ||
          Buffer.byteLength(file.content || "", "utf8"),
      };
    });

    const invalidFiles = filesToSave.filter(
      (file) => !file.fileName || !file.filePath
    );

    if (invalidFiles.length > 0) {
      console.log("Invalid extracted files:", invalidFiles);

      throw new AppError(
        "Some extracted files are missing fileName or filePath",
        500
      );
    }

    if (filesToSave.length > 0) {
      await File.insertMany(filesToSave);
    }

    project.totalFiles = filesToSave.length;
    project.status = "completed";
    await project.save();

    return res.status(201).json({
      success: true,
      message: "Project uploaded successfully",
      project,
      totalFiles: filesToSave.length,
    });
  } catch (error) {
    project.status = "failed";
    await project.save();

    await File.deleteMany({
      project: project._id,
      user: req.user._id,
    });

    return next(error);
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

const getProjects = catchAsync(async (req,res, next) =>{
    const projects = await Project.find({user:req.user._id}).sort({createdAt:-1});
    return res.status(200).json({
        success: true,
        count: projects.length,
        projects,
    });
});

const getSingleProject = catchAsync(async (req, res, next) =>{
    const project = await Project.findOne({
        _id:req.params.projectId,
        user:req.user._id
    })
    if(!project){
        return next(new appError("Project not found", 404));
    }
    return res.status(200).json({
        success: true,
        project
    });
});

const deleteProject = catchAsync(async (req,res, next) =>{
    const project = await Project.findOne({
        _id:req.params.projectId,
        user:req.user._id
    })
    if(!project){
        return next(new appError("Project not found", 404));
    }
    await File.deleteMany({project:project._id});
    await Project.findByIdAndDelete(project._id);
    return res.status(200).json({
        success: true,
        message: "Project deleted successfully"
    });
})


module.exports ={
    uploadProject,
    getProjects,
    getSingleProject,
    deleteProject
}
