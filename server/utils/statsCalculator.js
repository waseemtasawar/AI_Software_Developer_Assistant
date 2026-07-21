const path = require("path");

const codeExtensions = new Set([
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
]);

const countLines = (content = "") => {
  if (!content.trim()) {
    return 0;
  }

  return content.split(/\r\n|\r|\n/).length;
};

const calculateStatistics = (files = []) => {
  let totalLines = 0;
  let codeFiles = 0;

  const folderSet = new Set();

  files.forEach((file) => {
    const filePath = file.filePath
      ?.replace(/\\/g, "/")
      .replace(/^\/+/, "");

    const extension = path
      .extname(file.fileName || filePath || "")
      .toLowerCase();

    if (codeExtensions.has(extension)) {
      codeFiles += 1;
      totalLines += countLines(file.content || "");
    }

    if (filePath) {
      const pathParts = filePath.split("/");

      pathParts.pop();

      let currentPath = "";

      pathParts.forEach((folder) => {
        if (!folder) {
          return;
        }

        currentPath = currentPath
          ? `${currentPath}/${folder}`
          : folder;

        folderSet.add(currentPath);
      });
    }
  });

  return {
    totalFiles: files.length,
    codeFiles,
    totalLines,
    totalFolders: folderSet.size,
  };
};

module.exports = {
  calculateStatistics,
};