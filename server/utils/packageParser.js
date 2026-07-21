const parseJsonSafely = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
};

const findFileByName = (files, targetName) => {
  return files.find((file) => {
    const normalizedPath = file.filePath
      ?.replace(/\\/g, "/")
      .toLowerCase();

    const fileName = file.fileName?.toLowerCase();

    return (
      fileName === targetName.toLowerCase() ||
      normalizedPath?.endsWith(`/${targetName.toLowerCase()}`)
    );
  });
};

const getPackageData = (files) => {
  const packageFile = findFileByName(files, "package.json");

  if (!packageFile || !packageFile.content) {
    return {
      packageJson: null,
      dependencies: [],
      devDependencies: [],
    };
  }

  const packageJson = parseJsonSafely(packageFile.content);

  if (!packageJson) {
    return {
      packageJson: null,
      dependencies: [],
      devDependencies: [],
    };
  }

  return {
    packageJson,
    dependencies: Object.keys(packageJson.dependencies || {}),
    devDependencies: Object.keys(packageJson.devDependencies || {}),
  };
};

module.exports = {
  parseJsonSafely,
  findFileByName,
  getPackageData,
};