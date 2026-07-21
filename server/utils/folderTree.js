const buildFolderTree = (files = []) => {
  const tree = {
    name: "root",
    type: "folder",
    children: [],
  };

  files.forEach((file) => {
    const normalizedPath = (
      file.filePath ||
      file.fileName ||
      ""
    )
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    if (!normalizedPath) {
      return;
    }

    const pathParts = normalizedPath.split("/").filter(Boolean);

    let currentNode = tree;

    pathParts.forEach((part, index) => {
      const isFile = index === pathParts.length - 1;

      let existingNode = currentNode.children.find(
        (child) => child.name === part
      );

      if (!existingNode) {
        existingNode = {
          name: part,
          type: isFile ? "file" : "folder",
        };

        if (!isFile) {
          existingNode.children = [];
        }

        currentNode.children.push(existingNode);
      }

      if (!isFile) {
        currentNode = existingNode;
      }
    });
  });

  const sortNodes = (node) => {
    if (!node.children) {
      return;
    }

    node.children.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }

      return a.type === "folder" ? -1 : 1;
    });

    node.children.forEach(sortNodes);
  };

  sortNodes(tree);

  return tree;
};

module.exports = {
  buildFolderTree,
};