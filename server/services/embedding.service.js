const createGeminiClient = require("../config/gemini");

const generateEmbedding = async (text) => {
  if (!text || typeof text !== "string") {
    throw new Error(
      "Valid text is required to generate an embedding"
    );
  }

  const ai = createGeminiClient();

  const response = await ai.models.embedContent({
    model:
      process.env.EMBEDDING_MODEL ||
      "gemini-embedding-001",

    contents: text,

    config: {
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality:
        Number(process.env.EMBEDDING_DIMENSION) ||
        768,
    },
  });

  const embedding =
    response.embeddings?.[0]?.values ||
    response.embedding?.values;

  if (!Array.isArray(embedding)) {
    throw new Error(
      "Embedding model returned an invalid response"
    );
  }

  return embedding;
};

const generateQueryEmbedding = async (query) => {
  if (!query || typeof query !== "string") {
    throw new Error(
      "Valid query is required to generate an embedding"
    );
  }

  const ai = createGeminiClient();

  const response = await ai.models.embedContent({
    model:
      process.env.EMBEDDING_MODEL ||
      "gemini-embedding-001",

    contents: query,

    config: {
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality:
        Number(process.env.EMBEDDING_DIMENSION) ||
        768,
    },
  });

  const embedding =
    response.embeddings?.[0]?.values ||
    response.embedding?.values;

  if (!Array.isArray(embedding)) {
    throw new Error(
      "Embedding model returned an invalid response"
    );
  }

  return embedding;
};

module.exports = {
  generateEmbedding,
  generateQueryEmbedding,
};