const IORedis = require("ioredis");

const createdRedisConnection = () => {
    if (process.env.REDIS_URL) {
        return new IORedis(process.env.REDIS_URL, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        });
    }

    return new IORedis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,

        /*
     * BullMQ workers require this to be null.
     * It allows workers to continue waiting when Redis temporarily
     * becomes unavailable.
     */

        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });
}

module.exports = createdRedisConnection;