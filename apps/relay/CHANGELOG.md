# @farcaster/auth-relay

## 0.4.1

### Patch Changes

- 47a4c35: Test deploy with new CI auth method

## 0.4.0

### Minor Changes

- 7f05e73: Default acceptAuthAddress to true.

### Patch Changes

- 2ea5559: chore: s/warpcast.com/farcaster.xyz

## 0.3.1

### Patch Changes

- 5f30b12: chore: remove ethers.js dependency
- 185293a: fix: use consistent plugin registration style

## 0.3.0

### Minor Changes

- c9027f9: feat: auth addresses

### Patch Changes

- a4c367e: fix: Allow log level to be configured via environment variable
- 1384177: chore: update dependencies
- 41e83c0: fix: bump relay timeouts

## 0.2.1

### Patch Changes

- 827053c: drop SIWE params in constructUrl

## 0.2.0

### Minor Changes

- 088f6ca: Drop SIWE params from sign in URLs

## 0.1.1

### Patch Changes

- d3d9e63: fix: set generated nonce in signature params
- 92b841c: add request metadata to channel

## 0.1.0

### Minor Changes

- fb16a2c: chore: remove deprecated routes
- c4b36cf: chore: add dd-trace

### Patch Changes

- 4755c6d: feat: add SIWE params to channel body
- 70a4514: chore: add RPC URL env var

## 0.0.10

### Patch Changes

- 1265f28: feat: add fallback hub
- 62874a0: - support redirectUrl
  - remove ethers hard dependency
- 72239b1: chore: return response from async handler

## 0.0.9

### Patch Changes

- fix: use fastify default logger

## 0.0.8

### Patch Changes

- fix: handle new verification message name

## 0.0.7

### Patch Changes

- cfd30e4: Return custody address and verifications
- f697a4f: fix: allow port in domain

## 0.0.6

### Patch Changes

- Restore backwards compatible routes

## 0.0.5

### Patch Changes

- Rename packages.

## 0.0.4

### Patch Changes

- b52c1cb: fix: return nonce from /v1/connect

## 0.0.3

### Patch Changes

- 7694d67: Use Warpcast URLs

## 0.0.2

### Patch Changes

- Optional userData parameters
