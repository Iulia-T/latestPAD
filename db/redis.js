import redis from "ioredis";

const redisClient = new redis.Cluster([
  {
    host: "redis-node-1",
    port: 7777,
  },
  {
    host: "redis-node-2",
    port: 7001,
  },
  {
    host: "redis-node-3",
    port: 7002,
  },
  {
    host: "redis-node-4",
    port: 7003,
  },
  {
    host: "redis-node-5",
    port: 7004,
  },
  {
    host: "redis-node-6",
    port: 7005,
  },
]);

redisClient.on("error", (err) => {
  console.log("Error connecting to Redis:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("ready", () => {
  console.log("Redis client is ready");
});

redisClient.on("reconnecting", () => {
  console.log("Redis client is reconnecting");
});

process.on("exit", () => {
  redisClient.quit();
});

export default redisClient;
