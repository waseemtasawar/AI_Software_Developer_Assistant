const hasFile = (files, targetName) => {
  return files.some((file) => {
    const fileName = file.fileName?.toLowerCase();

    const normalizedPath = file.filePath
      ?.replace(/\\/g, "/")
      .toLowerCase();

    return (
      fileName === targetName.toLowerCase() ||
      normalizedPath?.endsWith(`/${targetName.toLowerCase()}`)
    );
  });
};

const detectPackageManager = (files) => {
  if (hasFile(files, "pnpm-lock.yaml")) {
    return "pnpm";
  }

  if (hasFile(files, "yarn.lock")) {
    return "yarn";
  }

  if (hasFile(files, "package-lock.json")) {
    return "npm";
  }

  if (hasFile(files, "package.json")) {
    return "npm";
  }

  if (hasFile(files, "requirements.txt")) {
    return "pip";
  }

  if (hasFile(files, "pyproject.toml")) {
    return "Poetry/pip";
  }

  if (hasFile(files, "pom.xml")) {
    return "Maven";
  }

  if (
    hasFile(files, "build.gradle") ||
    hasFile(files, "build.gradle.kts")
  ) {
    return "Gradle";
  }

  if (hasFile(files, "composer.json")) {
    return "Composer";
  }

  return "Not detected";
};

module.exports = {
  detectPackageManager,
};