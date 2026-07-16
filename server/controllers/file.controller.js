const File = require('../models/file.model');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');


const getProjectFiles = catchAsync(async (req, res, next) => {
    const files = await File.find({
        project: req.params.projectId,
        user: req.user._id,
    }) .select("-content")
    .sort({ filePath: 1 });

  if (files.length === 0) {
    return next(new AppError("No files found for this project", 404));
  }
    return res.status(200).json({
        success: true,
        count: files.length,
        files,
    });
})

const GetSingleFile = catchAsync(async (req, res, next) => {
    const file = await File.findOne({
        _id: req.params.fileId,
        user: req.user._id,
    }).select("-content")
    
    if (!file) {
        return next(new appError("File not found", 404));
    }
    return res.status(200).json({
        success: true,
        file,
    });
});


module.exports = {
    getProjectFiles,
    GetSingleFile,
};