const QUEUE_NAMES = Object.freeze({
    PROJECT_PROCESSING: 'project-processing',
});

const JOB_NAMES = Object.freeze({
    CHUNK_PROJECT: 'chunk-project',
    ANALYZE_PROJECT: 'analyze-project',
    GENERATE_EMBEDDINGS: 'generate-embeddings',
});

module.exports = {
    QUEUE_NAMES,
    JOB_NAMES,
};