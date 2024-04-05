import "dotenv/config";

export const LOG_LEVEL = process.env["LOG_LEVEL"] || "warn";

export const CHANNEL_TTL = Number(process.env["CHANNEL_TTL"] || "3600");

export const REDIS_URL = process.env["REDIS_URL"] || "redis://localhost:6379";

export const RELAY_SERVER_PORT = Number(process.env["RELAY_SERVER_PORT"] || "8000");
export const RELAY_SERVER_HOST = process.env["RELAY_SERVER_HOST"] || "localhost";

export const URL_BASE =
  process.env["URL_BASE"] || process.env["CONNECT_URI_BASE"] || "https://warpcast.com/~/sign-in-with-farcaster";

export const HUB_URL = process.env["HUB_URL"] || "https://nemes.farcaster.xyz:2281";
export const HUB_FALLBACK_URL = process.env["HUB_FALLBACK_URL"] || "https://hoyt.farcaster.xyz:2281";

export const OPTIMISM_RPC_URL = process.env["OPTIMISM_RPC_URL"] || "https://mainnet.optimism.io";

export const AUTH_KEY = process.env["AUTH_KEY"];
