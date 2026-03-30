---
"@farcaster/jfs": minor
---

Build `@farcaster/jfs` with `tsup` and publish proper ESM/CJS entrypoints.

The package now exposes real dual-format exports with working `import` and `require` entrypoints.

Deep imports such as `@farcaster/jfs/dist/*` are no longer supported now that the package uses an `exports` map.
