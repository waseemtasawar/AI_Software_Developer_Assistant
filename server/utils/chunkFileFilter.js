const path = require("path");

const allowedExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".cs",
  ".cpp",
  ".cc",
  ".cxx",
  ".c",
  ".php",
  ".rb",
  ".go",
  ".rs",
  ".swift",
  ".kt",
  ".kts",
  ".dart",
  ".vue",
  ".svelte",
  ".html",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".sql",
  ".sh",
  ".json",
  ".md",
  ".yaml",
  ".yml",
]);

const ignoredFileNames = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "composer.lock",
]);

const ignoredPathParts = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  "vendor",
  "__pycache__",
];

const shouldChunkFile = (file) => {
  const fileName = (
    file.fileName ||
    path.basename(file.filePath || "")
  ).toLowerCase();

  const normalizedPath = (
    file.filePath ||
    fileName
  )
    .replace(/\\/g, "/")
    .toLowerCase();

  if (!file.content || !file.content.trim()) {
    return false;
  }

  if (ignoredFileNames.has(fileName)) {
    return false;
  }

  const containsIgnoredPath = ignoredPathParts.some(
    (ignoredPart) =>
      normalizedPath
        .split("/")
        .includes(ignoredPart.toLowerCase())
  );

  if (containsIgnoredPath) {
    return false;
  }

  const extension = path.extname(fileName);

  return allowedExtensions.has(extension);
};

module.exports = {
  shouldChunkFile,
};