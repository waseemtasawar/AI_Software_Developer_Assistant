const {
  QdrantClient,
} = require("@qdrant/js-client-rest");

const createQdrantClient = () => {
  if (!process.env.QDRANT_URL) {
    throw new Error("QDRANT_URL is missing");
  }

  return new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY || undefined,
    checkCompatibility: false,
  });
};

module.exports = createQdrantClient;