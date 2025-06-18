/**
 * Custom base64url encoding utilities for browser compatibility.
 *
 * Node.js Buffer supports 'base64url' encoding natively, but this is not
 * available in browser environments. These utilities provide manual conversion
 * between base64 and base64url formats to ensure the library works in both
 * Node.js and web browsers.
 *
 * Base64url is a URL-safe variant of base64 that:
 * - Replaces '+' with '-'
 * - Replaces '/' with '_'
 * - Removes padding '=' characters
 */

export function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function fromBase64Url(base64url: string): string {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if needed
  const padding = base64.length % 4;
  if (padding) {
    base64 += "=".repeat(4 - padding);
  }

  return base64;
}
