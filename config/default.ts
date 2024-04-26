export default {
  PORT: 8080,
  MONGODB_URI: process.env.MONGODB_URI_DEV,
  MONGODB_URI_LOG: process.env.MONGODB_URI_LOG,
  NODE_ENV: process.env.NODE_ENV,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_HOST: process.env.REDIS_HOST,
};
