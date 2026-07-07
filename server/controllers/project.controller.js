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
    return next(new appError("Please provide a zip file", 400));
  }

  const projectName = name || req.file.originalname.replace(".zip", "");

  const project = await Project.create({
    user: req.user._id,
    name: projectName,
    description: description || "",
    originalFilename: req.file.originalname,
    status: "processing",
  });

  const extractedFiles = extractZipFile(req.file.path);

  const filesToSave = extractedFiles.map((file) => ({
    ...file,
    project: project._id,
    user: req.user._id,
  }));

  if (filesToSave.length > 0) {
    await File.insertMany(filesToSave);
  }

  project.totalFiles = filesToSave.length;
  project.status = "completed";
  await project.save();

  fs.unlinkSync(req.file.path);

  return res.status(201).json({
    success: true,
    message: "Project uploaded successfully",
    project,
    totalFiles: filesToSave.length,
  });
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
