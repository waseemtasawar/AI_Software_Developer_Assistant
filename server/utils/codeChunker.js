const {estimateTokenCount} = require("./tokenEstimator");

const DEFAULT_CHUNK_SIZE = 120;
const DEFAULT_OVERLAP = 20;

const normalizeContent = (content = "") => {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
};

const createChunk = ({
  lines,
  startIndex,
  endIndex,
  chunkIndex,
}) => {
  const selectedLines = lines.slice(startIndex, endIndex);
  const content = selectedLines.join("\n").trim();

  if (!content) {
    return null;
  }

  return {
    chunkIndex,
    startLine: startIndex + 1,
    endLine: endIndex,
    content,
    characterCount: content.length,
    estimatedTokenCount: estimateTokenCount(content),
  };
};

const splitCodeIntoChunks = (
  content,
  options = {}
) => {
  const chunkSize =
    Number(options.chunkSize) || DEFAULT_CHUNK_SIZE;

  const overlap =
    Number(options.overlap) || DEFAULT_OVERLAP;

  if (chunkSize <= 0) {
    throw new Error("Chunk size must be greater than zero");
  }

  if (overlap < 0) {
    throw new Error("Overlap cannot be negative");
  }

  if (overlap >= chunkSize) {
    throw new Error(
      "Overlap must be smaller than chunk size"
    );
  }

  const normalizedContent = normalizeContent(content);

  if (!normalizedContent.trim()) {
    return [];
  }

  const lines = normalizedContent.split("\n");
  const chunks = [];

  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < lines.length) {
    const endIndex = Math.min(
      startIndex + chunkSize,
      lines.length
    );

    const chunk = createChunk({
      lines,
      startIndex,
      endIndex,
      chunkIndex,
    });

    if (chunk) {
      chunks.push(chunk);
      chunkIndex += 1;
    }

    if (endIndex >= lines.length) {
      break;
    }

    startIndex = endIndex - overlap;
  }

  return chunks;
};

module.exports = {
  splitCodeIntoChunks,
};