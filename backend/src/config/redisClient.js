import redis from "redis";

/**
 * Redis Client Configuration
 * Used for caching subdomain → tenantId mappings
 * 
 * Falls back gracefully if Redis is not available
 */

let redisClient = null;
let isConnected = false;

// Create Redis client
try {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.warn("⚠️  Redis: Max reconnection attempts reached");
          return new Error("Max reconnection attempts reached");
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  // Handle connection events
  redisClient.on("connect", () => {
    // Silent connection
  });

  redisClient.on("ready", () => {
    isConnected = true;
  });

  redisClient.on("error", (err) => {
    isConnected = false;
    // Silent error - will use MongoDB fallback
  });

  redisClient.on("end", () => {
    isConnected = false;
  });

  // Connect to Redis
  redisClient.connect().catch((err) => {
    isConnected = false;
    // Silent failure - MongoDB fallback will be used
  });
} catch (err) {
  // Silent initialization failure - MongoDB fallback
  redisClient = null;
}

/**
 * Safe Redis operations with fallback
 */
const safeRedisClient = {
  async get(key) {
    if (!redisClient || !isConnected) return null;
    try {
      return await redisClient.get(key);
    } catch (err) {
      return null;
    }
  },

  async setex(key, seconds, value) {
    if (!redisClient || !isConnected) return false;
    try {
      await redisClient.setEx(key, seconds, value);
      return true;
    } catch (err) {
      return false;
    }
  },

  async del(key) {
    if (!redisClient || !isConnected) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (err) {
      return false;
    }
  },

  isReady() {
    return isConnected && redisClient !== null;
  },
};

export default safeRedisClient;
