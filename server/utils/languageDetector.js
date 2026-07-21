const path = require('path');

const extensionLanguageMap = {
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".mjs": "JavaScript",
  ".cjs": "JavaScript",

  ".ts": "TypeScript",
  ".tsx": "TypeScript",

  ".py": "Python",

  ".java": "Java",

  ".cs": "C#",

  ".cpp": "C++",
  ".cc": "C++",
  ".cxx": "C++",

  ".c": "C",

  ".php": "PHP",

  ".rb": "Ruby",

  ".go": "Go",

  ".rs": "Rust",

  ".swift": "Swift",

  ".kt": "Kotlin",
  ".kts": "Kotlin",

  ".dart": "Dart",

  ".html": "HTML",
  ".htm": "HTML",

  ".css": "CSS",
  ".scss": "SCSS",
  ".sass": "SASS",
  ".less": "LESS",

  ".sql": "SQL",

  ".vue": "Vue",

  ".svelte": "Svelte",

  ".sh": "Shell",

  ".json": "JSON",

  ".xml": "XML",

  ".md": "Markdown",
};

const detectLanguageFromFile = (fileName = "") =>{
    const extension = path.extname(fileName).toLowerCase();
    return extensionLanguageMap[extension] || "Other";
}

const detectLanguages = (files = []) => {
  const languageCounts = {};

  files.forEach((file) => {
    const language = detectLanguageFromFile(
      file.fileName || file.filePath || ""
    );

    languageCounts[language] =
      (languageCounts[language] || 0) + 1;
  });

  const totalFiles = files.length;

  const languages = Object.entries(languageCounts)
    .map(([name, count]) => ({
      name,
      files: count,
      percentage:
        totalFiles > 0
          ? Number(((count / totalFiles) * 100).toFixed(2))
          : 0,
    }))
    .sort((a, b) => b.files - a.files);

  const ignoredPrimaryLanguages = [
    "JSON",
    "Markdown",
    "Other",
    "HTML",
    "CSS",
    "SCSS",
    "SASS",
    "LESS",
  ];

  const primaryLanguage =
    languages.find(
      (language) =>
        !ignoredPrimaryLanguages.includes(language.name)
    )?.name ||
    languages[0]?.name ||
    "Unknown";

  return {
    primaryLanguage,
    languages,
  };
};

module.exports = {
    detectLanguageFromFile,
    detectLanguages,
};