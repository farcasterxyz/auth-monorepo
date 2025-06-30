import { LOG_LEVEL } from "./env";

export const logger = {
  level: LOG_LEVEL,
  redact: [
    "req.headers.authorization",
    'req.headers["x-farcaster-auth-relay-key"]',
    'req.headers["x-farcaster-connect-auth-key"]',
  ],
};

export default logger;
