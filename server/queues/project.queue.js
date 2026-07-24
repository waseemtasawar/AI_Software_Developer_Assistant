const {Queue} = require('bullmq');

const createdRedisConnection = require('../config/redis');

const {QUEUE_NAMES, JOB_NAMES}  = require('../constants/queueNames');

const projectQueue = new Queue(QUEUE_NAMES.PROJECT_PROCESSING, {
    connection: createdRedisConnection(),

    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: {
            age: 24 * 60 * 60, // 24 hours
            count: 500,
        },
        removeOnFail: {
            age: 7 * 24 * 60 * 60, // 7 days
            count: 1000,
        },
    },
});

const addChunkProjectJob = async ({
    projectId,
    userId,
    chunkSize = 120,
    overlap = 20,

}) => {
    return projectQueue.add(
        JOB_NAMES.CHUNK_PROJECT,
        {
            projectId: projectId.toString(),
            userId: userId.toString(),
            chunkSize,
            overlap,
        },
        {
            /*
       * Prevents duplicate chunking jobs for the same project.
       * A completed/failed job is eventually removed according
       * to the queue retention settings above.
       */
            jobId: `chunk-${projectId}`,
        }

    )
}

const addGenerateEmbeddingsJob = async ({
  projectId,
  userId,
}) => {
  return projectQueue.add(
    JOB_NAMES.GENERATE_EMBEDDINGS,
    {
      projectId: projectId.toString(),
      userId: userId.toString(),
    },
    {
      jobId: `embeddings-${projectId}-${Date.now()}`,
    }
  );
};

module.exports = {
    projectQueue,
    addChunkProjectJob,
    addGenerateEmbeddingsJob,
};