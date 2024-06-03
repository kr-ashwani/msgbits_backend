export default {
  PORT: Number(8080),
  MONGODB_URI: process.env.MONGODB_URI_DEV,
  MONGODB_URI_LOG: process.env.MONGODB_URI_LOG,
  NODE_ENV: process.env.NODE_ENV,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  SMTP_SERVICE: process.env.SMTP_SERVICE,
  SMTP_PORT: Number(process.env.SMTP_PORT),
  SMTP_SECURE: process.env.SMTP_SECURE === "yes" ? true : false,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  REFRESH_TOKEN_SECRET_KEY: process.env.REFRESH_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_EXP_TIME: Number(process.env.REFRESH_TOKEN_EXP_TIME),
  SOCKETUI_USERNAME:process.env.SOCKETUI_USERNAME,
  SOCKETUI_PASSWORD:process.env.SOCKETUI_PASSWORD
};
