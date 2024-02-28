export const logger = {
  level: "info",
  redact: [
    "req.headers.authorization",
    'req.headers["x-farcaster-auth-relay-key"]',
    'req.headers["x-farcaster-connect-auth-key"]',
  ],
};

export default logger;
