const createQdrantClient = require("../config/qdrant");

const getCollectionName = () =>
  process.env.QDRANT_COLLECTION ||
  "repomind_code_chunks";

const ensureCollectionExists = async () => {
  const client = createQdrantClient();
  const collectionName = getCollectionName();

  const collectionsResponse =
    await client.getCollections();

  const collectionExists =
    collectionsResponse.collections.some(
      (collection) =>
        collection.name === collectionName
    );

  if (!collectionExists) {
    await client.createCollection(collectionName, {
      vectors: {
        size:
          Number(
            process.env.EMBEDDING_DIMENSION
          ) || 768,

        distance: "Cosine",
      },
    });
  }

  return collectionName;
};

const upsertCodeVectors = async (points) => {
  if (!Array.isArray(points) || points.length === 0) {
    throw new Error(
      "At least one vector point is required"
    );
  }

  const client = createQdrantClient();
  const collectionName =
    await ensureCollectionExists();

  await client.upsert(collectionName, {
    wait: true,
    points,
  });
};

const searchCodeVectors = async ({
  vector,
  projectId,
  userId,
  limit = 8,
}) => {
  const client = createQdrantClient();
  const collectionName =
    await ensureCollectionExists();

  const response = await client.query(
    collectionName,
    {
      query: vector,

      filter: {
        must: [
          {
            key: "projectId",
            match: {
              value: projectId.toString(),
            },
          },
          {
            key: "userId",
            match: {
              value: userId.toString(),
            },
          },
        ],
      },

      limit,
      with_payload: true,
      with_vector: false,
    }
  );

  return response.points || [];
};

module.exports = {
  ensureCollectionExists,
  upsertCodeVectors,
  searchCodeVectors,
};