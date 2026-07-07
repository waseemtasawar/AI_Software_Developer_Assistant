const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const apperror = require('../utils/appError');


const allowedExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".html",
  ".css",
  ".scss",
  ".md",
  ".env.example",
  ".py",
];

const ignoredFolders = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".vscode",
];

const getLanguageFromExtension = (extension) => {
  const map = {
    ".js": "JavaScript",
    ".jsx": "React JSX",
    ".ts": "TypeScript",
    ".tsx": "React TSX",
    ".json": "JSON",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".md": "Markdown",
    ".py": "Python",
  };

  return map[extension] || "Text";
};


const shouldIgnoreFile = (filePath) => {
    return ignoredFolders.some((folder) => filePath.includes(`${folder}/`));
};

const isAllowedFiles = (filePath) =>{
    const extension = path.extname(filePath).toLowerCase();
    return allowedExtensions.includes(extension) || filePath.endsWith(".env");
};

const extractZipFile = (zipFilePath) =>{
    const zip = new AdmZip(zipFilePath);
    const entries = zip.getEntries();

    const files = [];

    entries.forEach((entry) =>{
        if(entry.isDirectory) return;

        const filePath = entry.entryName;
        if(shouldIgnoreFile(filePath)) return;
        if(!isAllowedFiles(filePath)) return;

        const content = entry.getData().toString('utf8');
        const extension = path.extname(filePath).toLowerCase();

        files.push({
            filename: path.basename(filePath),
            filePath,
            extension,
            content,
            language: getLanguageFromExtension(extension),
            size: Buffer.byteLength(content, 'utf8')
            
        })
    })
    return files;
}

module.exports = {
    extractZipFile
}